import type { Uuid, Node, Meta } from './agent'

interface Intention {
	purpose: string
	input: string
	output: string
}

export interface Project {
	resource: 'project/v1'
	meta: {
		id: Uuid
		name: string
		intention: Intention
	}
	spec: {
		modifiers?: Record<string, Uuid[]>
		nodes: Record<Uuid, Node>
	}
}

export interface Modifier {
	resource: string
	meta: {
		id: Uuid
		name: string
	}
	spec: Record<string, unknown> | undefined
}

export interface Variable extends Modifier {
	resource: 'variable/v1'
	spec: {
		key: string
		secret: boolean
		value: {
			dev: string
			stage: string
			prod: string
		}
	}
}

// This is going to extend modifiers once we migrate the triggers to modifiers
export interface Trigger {
	resource: 'endpoint/v1' | 'cron/v1'
	meta: Omit<Meta, 'intention'>
	spec: {
		component_id: Uuid
	}
}

export interface Endpoint extends Trigger {
	resource: 'endpoint/v1'
}

export interface Cron extends Trigger {
	resource: 'cron/v1'
	spec: {
		schedule: string
		input: Record<string, unknown> // TODO: payload here too?
	} & Trigger['spec']
}

export interface Payload {
	resource: 'payload/v1'
	meta: {
		id: Uuid
		name: string
	}
	spec: {
		name: string
		payload: string
	}
}
