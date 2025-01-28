import type { Uuid } from './agent'

// Custom data passed to each node
export interface NodeData {
	name: string
	component_version: number
	component_id: Uuid
	id?: string
	state?: 'success' | 'error' | 'running'
	onOpen?: () => void
}
