// In the future this will handle the entire chat window for the builder
// but for now it just allows us to easily pass data between
// eg the metadata panel item and the code editor, etc etc

import { type Component } from '$lib/types/agent'

// Generic base event types (probs should be moved to a types file)
interface BaseEvent {
	message_type: string
	event_name: string
	timestamp: string
	source: string
	task_id: string
	agent_message: string
}
interface CompletedEvent extends BaseEvent {
	success: boolean
	details: Record<string, string>
}

// Per-event types
export interface TaskCreated extends BaseEvent {
	task_id: BaseEvent['task_id']
	user_id: string
	message: string
}
export interface CodeEditStarted extends BaseEvent {
	details: {
		code: string
	}
}
export interface CodeEditCompleted extends CompletedEvent {
	details: {
		code: string
	}
}
export interface CodeInstallPackagesStarted extends BaseEvent {
	details: {
		requirements: string
	}
}
export type CodeInstallPackagesCompleted = CompletedEvent
export type CodeDocumentStarted = BaseEvent
export interface CodeDocumentCompleted extends CompletedEvent {
	details: {
		description: string
	}
}

type InProgressData = {
	component: Component
	message?: string
	taskId?: BaseEvent['task_id']
}
export const inProgressComponents = $state<Record<Component['meta']['id'], InProgressData>>({})
