import { uiMessageModel } from '$lib/schemas/chat'
import type z from 'zod'

export type Message = z.infer<typeof uiMessageModel>

// export interface EventData {
// 	id: string
// 	event: string
// 	data: any
// 	sourceId?: string
// 	runId?: string
// 	parentId?: string
// }

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

export const chat = $state<{ data: ParsedItem[] }>({
	data: []
})

const messages = $state(new Map<string, MessageData>())
const runs = $state(new Map<string, RunData>())
// Keeps track of active step's data and its parent array for nesting
const activeSteps = new Map<string, { step: StepData; parentArray: (StepData | MessageData)[] }>()

export function handleMessage(message: Message) {
	const { id, data, event, sourceId, runId, parentId } = message

	// Handle messages
	if (event === 'text_message_started') {
		messages.set(id, { type: 'message', role: data.role, content: '' })
	} else if (event === 'text_message_content' && sourceId && messages.has(sourceId)) {
		messages.get(sourceId)!.content += data.delta
	} else if (event === 'text_message_end' && sourceId && messages.has(sourceId)) {
		const message = messages.get(sourceId)!

		if (runId && runs.has(runId)) {
			runs.get(runId)!.children.push(message)
		} else {
			chat.data.push(message)
		}
		messages.delete(sourceId)
	}

	// Handle runs
	if (event === 'run_started') {
		const run: RunData = {
			type: 'run',
			id: id,
			children: [],
			completed: false
		}
		runs.set(id, run)
		chat.data.push(run)
	} else if (event === 'run_completed' && sourceId && runs.has(sourceId)) {
		runs.get(sourceId)!.completed = true
		runs.delete(sourceId)
	}

	// Handle steps and nested steps
	if (event === 'step_started') {
		const newStep: StepData = {
			type: 'step',
			id: id,
			event: 'started',
			title: data.title,
			children: [],
			completed: false
		}

		let parentArray: (StepData | MessageData)[] = []

		if (runId && runs.has(runId)) {
			if (parentId && activeSteps.has(parentId)) {
				// Nested step
				parentArray = activeSteps.get(parentId)!.step.children
				parentArray.push(newStep)
			} else {
				// Top-level step
				parentArray = runs.get(runId)!.children
				parentArray.push(newStep)
			}
		}
		activeSteps.set(id, { step: newStep, parentArray: parentArray })
	} else if (event === 'step_completed') {
		if (sourceId && activeSteps.has(sourceId)) {
			const { step, parentArray } = activeSteps.get(sourceId)!
			step.completed = true

			// const completedEvent: StepData = {
			// 	type: 'step',
			// 	id: sourceId,
			// 	event: 'completed',
			// 	title: data.title,
			// 	children: []
			// }
			// parentArray.push(completedEvent)

			activeSteps.delete(sourceId)
		}
	}
}

export function parseHistory(data: Message[]) {
	for (const message of data) {
		handleMessage(message)
	}
}
