import { uiMessageModel } from '$lib/schemas/chat'
import type z from 'zod'

export type Message = z.infer<typeof uiMessageModel>

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

export function handleMessage(msg: Message) {
	const { id, event, data, sourceId } = msg
	const runId = 'runId' in msg ? msg.runId : undefined
	const stepId = 'stepId' in msg ? msg.stepId : undefined

	switch (event) {
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
			if (runId) {
				const run = findRun(runId)
				if (run) {
					run.completed = true
				}
			}
			break
		}

		// -------- STEPS (nested) --------
		case 'step_start': {
			break
		}

		case 'step_complete': {
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
