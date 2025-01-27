// Custom data passed to each node
export interface NodeData {
	name: string
	version: number
	id?: string
	state?: 'success' | 'error' | 'running'
	onOpen?: () => void
}
