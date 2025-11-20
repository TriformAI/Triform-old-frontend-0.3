import { ackMessageModel, errorMessageModel, runCompletedModel, stepCompletedModel, uiMessageModel, widgetStartedModel } from '$lib/schemas/chat'
import { userMessageModel } from '$lib/schemas/chat'
import { toast } from 'svelte-sonner'
import { WebSocket } from 'partysocket'
import * as z from 'zod'
import { tick } from 'svelte'
import { inProgressComponents } from './builder.svelte'

// these don't have ids, just an ugly hack for TS for now :)
const ackModel = ackMessageModel.extend({ id: z.string() })
const errorModel = errorMessageModel.extend({ id: z.string() })
/* ChatEvent type alias removed to avoid parser issues in this environment */

export interface MessageData {
	id: string
	type: 'message'
	role: 'user' | 'assistant'
	content: string
	completed?: boolean
	context?: z.infer<typeof userMessageModel>['data']['context']
	snapshot?: string
}

export interface StepData {
	type: 'step'
	id: string
	event: 'started' | 'completed'
	title: string
	status?: z.infer<typeof stepCompletedModel>['data']['status']
	children: (StepData | MessageData | WidgetData)[]
	completed?: boolean
	input?: unknown
	output?: unknown
}

export interface RunData {
	type: 'run'
	id: string
	children: (StepData | MessageData | WidgetData)[]
	completed: boolean
	actions: z.infer<typeof runCompletedModel>['data']['actions']
}

export interface WidgetData {
	type: 'widget'
	id: string
	data: z.infer<typeof widgetStartedModel>['data']
	completed: boolean
}

export type ParsedItem = MessageData | RunData | StepData | WidgetData

export type UserMessage = Omit<
	z.infer<typeof userMessageModel>,
	'id' | 'runId' | 'sourceId' | 'stepId'
>

export type ChatUrlBuilder = (ctx: { id?: string; startId: string }) => string

export type WidgetCompleteCallback = (widgetId: string) => void | Promise<void>

export const chat = $state<{ 
	socket: WebSocket | null
	startId: string
	currentRunId: string | undefined
	data: ParsedItem[]
	isInitialized: boolean
	isInitializing: boolean
}>({
	socket: null,
	startId: '0',
	currentRunId: undefined,
	data: [],
	isInitialized: false,
	isInitializing: false
})

const isNearBottom = (container: HTMLElement, threshold = 100): boolean => {
	const { scrollTop, scrollHeight, clientHeight } = container
	return scrollHeight - scrollTop - clientHeight < threshold
}

export function scrollToBottom(chatMessagesContainer: HTMLElement, instant = false) {
	if (chatMessagesContainer) {
		chatMessagesContainer.scrollTo({
			top: chatMessagesContainer.scrollHeight,
			behavior: instant ? 'instant' : 'smooth'
		})
	}
}

export const messages = $state<any[]>([])

const activeScrollContainers = new Set<HTMLElement>()
const activeOnMessageCallbacks = new Set<() => void>()

export const initWebsocket = (
	resourceId: string | undefined,
	chatMessagesContainer: HTMLElement,
	onMessage: (() => void) | undefined,
	buildWsUrl: ChatUrlBuilder
): Promise<WebSocket> => new Promise((resolve) => {
	const socket = new WebSocket(
		() => buildWsUrl({ id: resourceId, startId: chat.startId ?? '0' })
	)
	chat.socket = socket

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
			// Always scroll to bottom for user messages, otherwise only if near bottom
			const isAckMessage = message.event === 'ack'
				for (const container of activeScrollContainers) {
					if (isAckMessage || isNearBottom(container)) {
						scrollToBottom(container)
					}
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

})

export const initChat = async (
	resourceId: string | undefined,
	chatMessagesContainer: HTMLElement,
	onMessage: (() => void) | undefined,
	getMessages: (id?: string) => Promise<any[]>,
	buildWsUrl: ChatUrlBuilder
) => {
	// Add this container to the set of active containers
	activeScrollContainers.add(chatMessagesContainer)
	if (onMessage) activeOnMessageCallbacks.add(onMessage)

	// Guard against double initialization - if already initialized, just register this container
	if (chat.socket || chat.isInitializing || chat.isInitialized) {
		console.log('Socket already initialized or initializing, registered new container')
	}

	chat.isInitializing = true
	chat.data = []
	chat.startId = '0'

	try {
		// First load the message history
		const msgs = await getMessages(resourceId)
		parseHistory(msgs)
		setTimeout(() => {
			// Scroll all active containers
			for (const container of activeScrollContainers) {
				scrollToBottom(container, true)
			}
		}, 100)

		// Then establish WebSocket connection with the correct startId (set by parseHistory)
		await initWebsocket(resourceId, chatMessagesContainer, onMessage, buildWsUrl)
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
	console.log('cleanupChat', chat.socket)
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

function findWidgetRecursive(widgetId: string, items: ParsedItem[]): WidgetData | undefined {
	for (const item of items) {
		if (item.type === 'widget' && item.id === widgetId) {
			return item
		}
		if (item.type === 'run' || item.type === 'step') {
			const found = findWidgetRecursive(widgetId, item.children)
			if (found) return found
		}
	}
	return undefined
}

function findWidget(widgetId: string): WidgetData | undefined {
	return findWidgetRecursive(widgetId, chat.data)
}

const parseId = (id: string) => parseInt(id.split('-')[0])
export function handleMessage(msg: any) {
	// console.log('handleMessage', msg)

	const { id, event, data, sourceId } = msg as any
	const runId = 'runId' in msg ? (msg as any).runId : undefined
	const stepId = 'stepId' in msg ? (msg as any).stepId : undefined

	if (!chat.startId || parseInt(id?.split('-')[0] ?? '0') > parseInt(chat.startId?.split('-')[0])) {
		chat.startId = id
	}

	switch (event) {
		case 'ack': {
			handleMessage((data as any))
			break
		}
		case 'error': {
			toast.error((data as any).error?.message ?? 'Unknown error, please try again later')
			break
		}

		// -------- USER MESSAGES --------
		case 'user_message': {
			if (findMessage(id)) break
			chat.data.push({
				id,
				type: 'message',
				role: 'user',
				content: ((data as { content: { type: 'text'; text: string }[] }).content)
					.map(item => item.text)
					.join(''),
				context: data.context,
				snapshot: data.snapshot
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
					if (message && !message.completed) {
						message.content += (data as any).delta
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

			// if this run id is higher than the current run id, set it as the current run id
			if (parseId(id) > parseId(chat.currentRunId ?? '0'))
				chat.currentRunId = id

			chat.data.push({ type: 'run', id, children: [], completed: false, actions: [] })
			break
		}

		case 'run_complete': {
			// really we should only clear the active component, but this is good enough of a hack for now
			inProgressComponents.clear()
			const run = findRun(sourceId)
			if (run) {
				run.completed = true
				// end current run
				// chat.currentRunId = undefined
				if (data && 'actions' in data) run.actions = data.actions
			}
			break
		}

		// -------- STEPS (nested) --------
		case 'step_start': {
			const newStep: StepData = {
				type: 'step',
				id,
				event: 'started',
				title: (data as any).title,
				children: [],
				completed: false,
				input: data.input
			}

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
				step.title = (data as any).title
				step.event = 'completed'
				step.status = (data as any).status
				step.completed = true
				step.output = data.output
			}
			break
		}

			// -------- WIDGETS --------
			case 'widget_start': {
				const newWidget: WidgetData = {
					type: 'widget',
					id,
					data: data as any,
					completed: false
				}

				if (stepId) {
					const parentStep = findStep(stepId)
					if (parentStep) {
						parentStep.children.push(newWidget)
					}
				} else if (runId) {
					const run = findRun(runId)
					if (run) {
						run.children.push(newWidget)
					}
				}

				try {
					const componentId = (data as any)?.metadata?.pendingComponents?.componentId as string | undefined
					if (componentId) inProgressComponents.add(componentId)
				} catch {}

				break
			}

			case 'widget_complete': {
				const widget = findWidget(sourceId)
				if (widget) {
					widget.completed = true
					try {
						const componentId = (widget.data as any)?.metadata?.pendingComponents?.componentId as string | undefined
						if (componentId) inProgressComponents.delete(componentId)
					} catch {}
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
export function parseHistory(history: any[]) {
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