import type { Uuid, Node } from './agent'

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

export interface Variable {
	resource: 'variable/v1'
	meta: {
		id: Uuid
		name: string
	}
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
