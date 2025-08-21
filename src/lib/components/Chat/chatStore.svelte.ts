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
	stepId?: string
): (StepData | MessageData)[] | ParsedItem[] {
	// returns the parent array we attached to
	if (stepId) {
		const parentStep = steps.get(stepId)
		if (parentStep) {
			parentStep.children = [...parentStep.children, item]
			if ((item as StepData).type === 'step') stepAttached.add((item as StepData).id)
			return parentStep.children
		} else {
			const q = pendingChildrenForStep.get(stepId) ?? []
			q.push(item)
			pendingChildrenForStep.set(stepId, q)
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
	if (!oldObj) return

	// If we don't have a tracked parent array, it might be in chat.data
	if (!parentArr) {
		const idx = chat.data.findIndex(
			it => (it as MessageData).type === 'message' && it === oldObj
		)
		if (idx !== -1) {
			chat.data.splice(idx, 1, newObj)
			chat.data = [...chat.data]
			finalizedMessages.set(id, newObj)
		}
		return
	}

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

	// Find and reassign the container to ensure update
	for (const run of runs.values()) {
		if (run.children === parentArr) {
			run.children = [...parentArr]
			finalizedMessages.set(id, newObj)
			return
		}
	}
	for (const step of steps.values()) {
		if (step.children === parentArr) {
			step.children = [...parentArr]
			finalizedMessages.set(id, newObj)
			return
		}
	}
}

// ---- main handler -----------------------------------------------------------
export function handleMessage(msg: Message) {
	const { id, event, data, sourceId } = msg
	const runId = 'runId' in msg ? msg.runId : undefined
	const stepId = 'stepId' in msg ? msg.stepId : undefined

	switch (event) {
		// -------- USER MESSAGES --------
		case 'user_message': {
			const messageObj: MessageData = {
				type: 'message',
				role: 'user',
				content: (data as { content: { type: 'text'; text: string }[] }).content
					.map(item => item.text)
					.join('')
			}
			attachToParentOrRun(messageObj, runId, stepId)
			break
		}

		// -------- TEXT MESSAGES --------
		case 'text_message_start': {
			const buf = messageBuffers.get(id) ?? { content: '' }
			// Note: role will be determined when message ends, defaulting to 'assistant'
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

			const parentArr = attachToParentOrRun(messageObj, runId, stepId)

			// keep references for late deltas
			messageBuffers.delete(sourceId)
			finalizedMessages.set(sourceId, messageObj)
			// Only set parent arrays for non-chat.data arrays (to avoid RunData type issues)
			if (parentArr !== chat.data) {
				messageParentArrays.set(sourceId, parentArr as (StepData | MessageData)[])
			}
			break
		}

		// -------- RUNS --------
		case 'run_start': {
			ensureRun(id)
			break
		}

		case 'run_complete': {
			if (!sourceId) break
			const run = ensureRun(sourceId)
			run.completed = true
			break
		}

		// -------- STEPS (nested) --------
		case 'step_start': {
			const step = ensureStep(id)
			step.event = 'started'
			step.title = (data as { title?: string })?.title ?? step.title
			if (!stepAttached.has(id)) {
				attachToParentOrRun(step, runId, stepId)
			}
			tryAdoptPendingChildren(id)
			break
		}

		case 'step_complete': {
			if (!sourceId) break
			const step = ensureStep(sourceId)
			step.completed = true
			step.event = 'completed'
			if (!stepAttached.has(sourceId)) {
				attachToParentOrRun(step, runId, stepId)
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
