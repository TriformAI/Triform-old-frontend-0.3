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
		nodes: {
			[k: Uuid]: Node
		}
	}
}
