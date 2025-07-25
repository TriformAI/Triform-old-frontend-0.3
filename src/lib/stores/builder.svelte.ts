// In the future this will handle the entire chat window for the builder
// but for now it just allows us to easily pass data between
// eg the metadata panel item and the code editor, etc etc

import { type Component } from '$lib/types/resources'

// Generic base event types (probs should be moved to a types file)
interface BaseEvent {
	event_name: string
	timestamp: string
	task_id: string
	agent_message: string
}
interface CompletedEvent extends BaseEvent {
	success: boolean
	details: Record<string, unknown>
}

// Per-event types
export interface TaskCreated extends BaseEvent {
	task_id: BaseEvent['task_id']
	user_id: string
	message: string
}
export interface ActionBuildStarted extends BaseEvent {
	details: {
		task_id: string
		message: string
	}
}
export interface ActionBuildProgress extends BaseEvent {
	status: string
	sub_step: string
	details: {
		code?: string
		output?: string
		pseudocode?: string
		packages?: string
		description?: string
		usage_examples?: string
	}
}

export interface ActionBuildCompleted extends CompletedEvent {
	details: {
		task_id: string
		status: string
		message: string
		result: Component[]
	}
}

type InProgressData = {
	component: Component
	message?: string
	taskId?: BaseEvent['task_id']
}
export const inProgressComponents = $state<Record<Component['meta']['id'], InProgressData>>({})
