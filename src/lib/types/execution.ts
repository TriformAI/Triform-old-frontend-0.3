import type { Uuid } from './agent'

export interface Execution {
	resource: 'execution/v1'
	input: Record<string, unknown>
	turbo: boolean
	spec: {
		component_id: Uuid
		component_version: number
	}
}
