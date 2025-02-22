import type { Uuid, Node } from './agent'

export interface Project {
	resource: 'project/v1'
	meta: {
		id: Uuid
		name: string
		intention: string
	}
	spec: {
		nodes: {
			[k: Uuid]: Node
		}
	}
}
