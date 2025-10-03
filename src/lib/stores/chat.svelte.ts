import { ackMessageModel, errorMessageModel, uiMessageModel } from '$lib/schemas/chat'
import { userMessageModel } from '$lib/schemas/chat'
import { toast } from 'svelte-sonner'
import { WebSocket } from 'partysocket'
import { throttle } from '$lib/utils/throttle'
import * as z from 'zod'
import { tick } from 'svelte'
import { inProgressComponents } from './builder.svelte'

// these don't have ids, just an ugly hack for TS for now :)
const ackModel = ackMessageModel.extend({ id: z.string() })
const errorModel = errorMessageModel.extend({ id: z.string() })
export type Message =
	| z.infer<typeof uiMessageModel>
	| z.infer<typeof ackModel>
	| z.infer<typeof errorModel>

export interface MessageData {
	id: string
	type: 'message'
	role: 'user' | 'assistant'
	content: string
	completed?: boolean
	context?: z.infer<typeof userMessageModel>['data']['context']
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

export type UserMessage = Omit<
	z.infer<typeof userMessageModel>,
	'id' | 'runId' | 'sourceId' | 'stepId'
>

export const chat = $state<{ 
	socket: WebSocket | null
	startId: string
	data: ParsedItem[]
	isInitialized: boolean
	isInitializing: boolean
}>({
	socket: null,
	startId: '0',
	data: [],
	isInitialized: false,
	isInitializing: false
})

export function scrollToBottom(chatMessagesContainer: HTMLElement, instant = false) {
	if (chatMessagesContainer) {
		chatMessagesContainer.scrollTo({
			top: chatMessagesContainer.scrollHeight,
			behavior: instant ? 'instant' : 'smooth'
		})
	}
}

const throttledScrollToBottom = throttle(scrollToBottom, 100)

export const messages = $state<Message[]>([])

const activeScrollContainers = new Set<HTMLElement>()
const activeOnMessageCallbacks = new Set<() => void>()

export const initWebsocket = (
	projectId: string,
	chatMessagesContainer: HTMLElement,
	onMessage?: () => void
) => new Promise((resolve) => {
	const socket = new WebSocket(
		() => `/api/projects/${projectId}/chat?startId=${chat.startId ?? '0'}`
	)

	socket.onopen = () => {
		console.log('WebSocket connected')
		resolve(socket)
	}

	socket.onmessage = async e => {
		try {
			const message = JSON.parse(e.data)
			messages.push(message)
			handleMessage(message)

			// Call all registered callbacks
			for (const callback of activeOnMessageCallbacks) {
				callback()
			}

			await tick()
			// Scroll all active containers
			for (const container of activeScrollContainers) {
				scrollToBottom(container)
			}
		} catch (error) {
			console.error('error handling message', error)
			toast.error('Unknown error, please try again later')
		}
	}

	socket.onclose = () => {
		console.log('Socket closed')
		chat.isInitialized = false
	}

	socket.onerror = err => {
		console.error('Socket error', err)
	}

	chat.socket = socket
})

export const initChat = async (
	projectId: string,
	chatMessagesContainer: HTMLElement,
	onMessage: (() => void) | undefined,
	getMessages: (id: string) => Promise<Message[]>
) => {
	// Add this container to the set of active containers
	activeScrollContainers.add(chatMessagesContainer)
	if (onMessage) activeOnMessageCallbacks.add(onMessage)

	// Guard against double initialization - if already initialized, just register this container
	if (chat.socket || chat.isInitializing || chat.isInitialized) {
		console.log('Socket already initialized or initializing, registered new container')
		return
	}

	chat.isInitializing = true
	chat.data = []
	chat.startId = '0'

	try {
		// First load the message history
		const msgs = await getMessages(projectId)
		parseHistory(msgs)
		setTimeout(() => {
			// Scroll all active containers
			for (const container of activeScrollContainers) {
				scrollToBottom(container, true)
			}
		}, 100)

		// Then establish WebSocket connection with the correct startId (set by parseHistory)
		await initWebsocket(projectId, chatMessagesContainer, onMessage)
		
		chat.isInitialized = true
	} finally {
		chat.isInitializing = false
	}
}

export const unregisterChatContainer = (
	chatMessagesContainer: HTMLElement,
	onMessage?: () => void
) => {
	activeScrollContainers.delete(chatMessagesContainer)
	if (onMessage) activeOnMessageCallbacks.delete(onMessage)
}

export const cleanupChat = () => {
	try {
		chat.socket?.close()
		chat.socket = null
		chat.isInitialized = false
		chat.isInitializing = false
		activeScrollContainers.clear()
		activeOnMessageCallbacks.clear()
	} catch (err) {
		console.error('error closing socket', err)
	}
}

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
	//console.log('handleMessage', msg)

	const { id, event, data, sourceId } = msg
	const runId = 'runId' in msg ? msg.runId : undefined
	const stepId = 'stepId' in msg ? msg.stepId : undefined

	if (!chat.startId || parseInt(id?.split('-')[0] ?? '0') > parseInt(chat.startId?.split('-')[0])) {
		chat.startId = id
	}

	switch (event) {
		case 'ack': {
			handleMessage(data)
			break
		}
		case 'error': {
			toast.error(data.error?.message ?? 'Unknown error, please try again later')
			break
		}

		// -------- USER MESSAGES --------
		case 'user_message': {
			if (findMessage(id)) break
			chat.data.push({
				id,
				type: 'message',
				role: 'user',
				content: (data as { content: { type: 'text'; text: string }[] }).content
					.map(item => item.text)
					.join(''),
				context: data.context
			} satisfies MessageData)

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
					// console.log('message', $state.snapshot(message))
					// console.log('data.delta', data.delta)

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
			// really we should only clear the active component, but this is good enough of a hack for now
			inProgressComponents.clear()
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
	//resetChatState()

	for (const m of history) handleMessage(m)
}

// Factory func for default state of userMessage
export function getUserMessage(): UserMessage {
	return {
		event: 'user_message',
		data: {
			content: [
				{
					type: 'text',
					text: ''
				}
			],
			context: {}
		}
	}
}
