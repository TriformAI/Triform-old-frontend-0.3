import { uiMessageModel } from '$lib/schemas/chat'
import type z from 'zod'

export type Message = z.infer<typeof uiMessageModel>

export interface MessageData {
	type: 'message'
	role: 'user' | 'assistant'
	content: string
}

export interface StepData {
	type: 'step'
	id: string
	event: 'started' | 'completed'
	title: string
	children: (StepData | MessageData)[]
	completed?: boolean
}

export interface RunData {
	type: 'run'
	id: string
	children: (StepData | MessageData)[]
	completed: boolean
}

export type ParsedItem = MessageData | RunData | StepData

export const chat = $state<{ data: ParsedItem[] }>({ data: [] })

// ---- internal state ---------------------------------------------------------
const runs = $state(new Map<string, RunData>())
const steps = $state(new Map<string, StepData>())
const stepAttached = $state(new Set<string>())

const messageBuffers = $state(new Map<string, { role?: 'user' | 'assistant'; content: string }>())

// After a message is rendered, keep:
// 1) reference to the message object
// 2) reference to its parent array (to replace immutably later)
const finalizedMessages = $state(new Map<string, MessageData>())
const messageParentArrays = $state(new Map<string, (StepData | MessageData)[]>())

const pendingChildrenForStep = $state(new Map<string, (StepData | MessageData)[]>())
const pendingChildrenForRun = $state(new Map<string, (StepData | MessageData)[]>())

// ---- helpers ----------------------------------------------------------------
function ensureRun(runId: string): RunData {
	let run = runs.get(runId)
	if (!run) {
		run = { type: 'run', id: runId, children: [], completed: false }
		runs.set(runId, run)
		chat.data.push(run)
		const pending = pendingChildrenForRun.get(runId)
		if (pending?.length) {
			run.children = [...run.children, ...pending]
			pendingChildrenForRun.delete(runId)
		}
	}
	return run
}

function ensureStep(stepId: string): StepData {
	let step = steps.get(stepId)
	if (!step) {
		step = {
			type: 'step',
			id: stepId,
			event: 'started',
			title: '(untitled)',
			children: [],
			completed: false
		}
		steps.set(stepId, step)
	}
	return step
}

function attachToParentOrRun(
	item: StepData | MessageData,
	runId?: string,
	parentId?: string
): (StepData | MessageData)[] {
	// returns the parent array we attached to
	if (parentId) {
		const parentStep = steps.get(parentId)
		if (parentStep) {
			parentStep.children = [...parentStep.children, item]
			if ((item as StepData).type === 'step') stepAttached.add((item as StepData).id)
			return parentStep.children
		} else {
			const q = pendingChildrenForStep.get(parentId) ?? []
			q.push(item)
			pendingChildrenForStep.set(parentId, q)
			return q
		}
	}

	if (runId) {
		const run = runs.get(runId)
		if (run) {
			run.children = [...run.children, item]
			if ((item as StepData).type === 'step') stepAttached.add((item as StepData).id)
			return run.children
		} else {
			const q = pendingChildrenForRun.get(runId) ?? []
			q.push(item)
			pendingChildrenForRun.set(runId, q)
			return q
		}
	}

	chat.data = [...chat.data, item]
	if ((item as StepData).type === 'step') stepAttached.add((item as StepData).id)
	return chat.data
}

function tryAdoptPendingChildren(stepId: string) {
	const pending = pendingChildrenForStep.get(stepId)
	if (pending?.length) {
		const step = steps.get(stepId)
		if (step) {
			step.children = [...step.children, ...pending]
			pendingChildrenForStep.delete(stepId)
		}
	}
}

// Replace a finalized message in its parent array with a fresh object to trigger reactivity
function replaceFinalizedMessage(id: string, newObj: MessageData) {
	const parentArr = messageParentArrays.get(id)
	const oldObj = finalizedMessages.get(id)
	if (!parentArr || !oldObj) return

	const idx = parentArr.indexOf(oldObj)
	if (idx === -1) {
		// parent array might have been replaced; try to find by shallow equality
		const altIdx = parentArr.findIndex(
			it => (it as MessageData).type === 'message' && (it as MessageData).content === oldObj.content
		)
		if (altIdx === -1) return
		parentArr.splice(altIdx, 1, newObj)
	} else {
		parentArr.splice(idx, 1, newObj)
	}

	// Reassign the parent array to ensure update
	if (parentArr === chat.data) {
		chat.data = [...parentArr]
	} else {
		// Could be a run or step children; find and reassign that container too
		for (const run of runs.values()) {
			if (run.children === parentArr) {
				run.children = [...parentArr]
				return
			}
		}
		for (const step of steps.values()) {
			if (step.children === parentArr) {
				step.children = [...parentArr]
				return
			}
		}
	}
	// Update our reference
	finalizedMessages.set(id, newObj)
}

// ---- main handler -----------------------------------------------------------
export function handleMessage(msg: Message) {
	const { id, event, data, sourceId, runId, parentId } = msg

	switch (event) {
		// -------- TEXT MESSAGES --------
		case 'text_message_started': {
			const buf = messageBuffers.get(id) ?? { content: '' }
			buf.role = data?.role as 'user' | 'assistant'
			messageBuffers.set(id, buf)
			break
		}

		case 'text_message_content': {
			if (!sourceId) break
			const delta = data?.delta ?? ''

			// 1) Still buffering?
			const buf = messageBuffers.get(sourceId)
			if (buf) {
				buf.content += delta
				messageBuffers.set(sourceId, buf)
				break
			}

			// 2) Already finalized → replace object in parent array (immutably)
			const finalized = finalizedMessages.get(sourceId)
			if (finalized) {
				const updated: MessageData = {
					...finalized,
					content: finalized.content + delta
				}
				replaceFinalizedMessage(sourceId, updated)
				break
			}

			// 3) Neither → start buffer implicitly
			messageBuffers.set(sourceId, { content: delta })
			break
		}

		case 'text_message_end': {
			if (!sourceId) break
			if (finalizedMessages.has(sourceId)) break // duplicate end

			const buf = messageBuffers.get(sourceId) ?? { content: '' }
			const role = (buf.role ?? 'assistant') as 'user' | 'assistant'
			const messageObj: MessageData = { type: 'message', role, content: buf.content }

			const parentArr = attachToParentOrRun(messageObj, runId, undefined)

			// keep references for late deltas
			messageBuffers.delete(sourceId)
			finalizedMessages.set(sourceId, messageObj)
			messageParentArrays.set(sourceId, parentArr)
			break
		}

		// -------- RUNS --------
		case 'run_started': {
			ensureRun(id)
			break
		}

		case 'run_completed': {
			if (!sourceId) break
			const run = ensureRun(sourceId)
			run.completed = true
			break
		}

		// -------- STEPS (nested) --------
		case 'step_started': {
			const step = ensureStep(id)
			step.event = 'started'
			step.title = data?.title ?? step.title
			if (!stepAttached.has(id)) {
				attachToParentOrRun(step, runId, parentId)
			}
			tryAdoptPendingChildren(id)
			break
		}

		case 'step_completed': {
			if (!sourceId) break
			const step = ensureStep(sourceId)
			step.completed = true
			step.event = 'completed'
			if (!stepAttached.has(sourceId)) {
				attachToParentOrRun(step, runId, parentId)
				tryAdoptPendingChildren(sourceId)
			}
			break
		}

		default:
			break
	}
}

export function resetChatState() {
	chat.data = []

	runs.clear()
	steps.clear()
	stepAttached.clear()

	messageBuffers.clear()
	finalizedMessages.clear()
	messageParentArrays.clear()

	pendingChildrenForRun.clear()
	pendingChildrenForStep.clear()
}

// Replay a backlog/history
export function parseHistory(history: Message[]) {
	resetChatState()

	for (const m of history) handleMessage(m)
}
