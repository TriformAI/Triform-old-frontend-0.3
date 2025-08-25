import { ackMessageModel, uiMessageModel } from '$lib/schemas/chat'
import * as z from 'zod'

const ackModel = ackMessageModel.extend({ id: z.string() })
export type Message = z.infer<typeof uiMessageModel> | z.infer<typeof ackModel>
let startId: string | undefined
export const getStartId = () => startId

export interface MessageData {
	id: string
	type: 'message'
	role: 'user' | 'assistant'
	content: string
	completed?: boolean
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

function findRun(id: string): RunData | undefined {
	return chat.data.find(it => it.type === 'run' && it.id === id) as RunData
}

function findMessage(msgId: string, run?: RunData): MessageData | undefined {
	if (run) {
		return run.children.find(it => it.type === 'message' && it.id === msgId) as MessageData
	}

	return chat.data.find(it => it.type === 'message' && it.id === msgId) as MessageData
}

function findStepRecursive(stepId: string, items: ParsedItem[]): StepData | undefined {
	for (const item of items) {
		if (item.type === 'step' && item.id === stepId) {
			return item
		}
		
		if (item.type === 'run' || item.type === 'step') {
			const found = findStepRecursive(stepId, item.children)
			if (found) return found
		}
	}
	return undefined
}

function findStep(stepId: string): StepData | undefined {
	return findStepRecursive(stepId, chat.data)
}

export function handleMessage(msg: Message) {
	const { id, event, data, sourceId } = msg
	const runId = 'runId' in msg ? msg.runId : undefined
	const stepId = 'stepId' in msg ? msg.stepId : undefined

	if (!startId || parseInt(id.split('-')[0]) > parseInt(startId?.split('-')[0])) startId = id

	switch (event) {
		case 'ack': {
			handleMessage(data)			
			break
		}
		// -------- USER MESSAGES --------
		case 'user_message': {
			if (findMessage(id)) {
				return
			}

			const messageObj: MessageData = {
				id,
				type: 'message',
				role: 'user',
				content: (data as { content: { type: 'text'; text: string }[] }).content
					.map(item => item.text)
					.join('')
			}

			chat.data.push(messageObj)
			break
		}

		// -------- TEXT MESSAGES --------
		case 'text_message_start': {
			const messageObj: MessageData = {
				id,
				type: 'message',
				role: 'assistant',
				content: ''
			}

			if (runId) {
				const run = findRun(runId)
				if (run) {
					run.children.push(messageObj)
				}
			}

			break
		}

		case 'text_message_content': {
			if (runId) {
				const run = findRun(runId)
				if (run) {
					const message = findMessage(sourceId, run)
					if (message && !message.completed) {
						message.content += data.delta
					}
				}
			}
			break
		}

		case 'text_message_end': {
			if (runId) {
				const run = findRun(runId)
				if (run) {
					const message = findMessage(sourceId, run)
					if (message) {
						message.completed = true
					}
				}
			}
			break
		}

		// -------- RUNS --------
		case 'run_start': {
			if (findRun(id)) {
				break
			}

			chat.data.push({ type: 'run', id, children: [], completed: false })
			break
		}

		case 'run_complete': {
			const run = findRun(sourceId)
			if (run) {
				run.completed = true
			}
			break
		}

		// -------- STEPS (nested) --------
		case 'step_start': {
			const newStep: StepData = {
				type: 'step',
				id,
				event: 'started',
				title: data.title,
				children: [],
				completed: false
			}

			// TODO: if we found any events for this step already, use completed & title from there instead
			// If stepId is provided, nest inside that step
			if (stepId) {
				const parentStep = findStep(stepId)
				if (parentStep) {
					parentStep.children.push(newStep)
				}
			}
			// Otherwise, nest inside the run
			else if (runId) {
				const run = findRun(runId)
				if (run) {
					run.children.push(newStep)
				}
			}
			break
		}

		case 'step_complete': {
			// Find the step by sourceId
			const step = findStep(sourceId)
			if (step) {
				step.title = data.title
				step.event = 'completed'
				step.completed = true
			}
			break
		}

		default:
			break
	}
}

export function resetChatState() {
	chat.data = []
}

// Replay a backlog/history
export function parseHistory(history: Message[]) {
	resetChatState()

	for (const m of history) handleMessage(m)
}
