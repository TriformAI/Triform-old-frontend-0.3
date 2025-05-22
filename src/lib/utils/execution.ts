import type { Execution } from '$lib/types/execution'
import type { Component } from '$lib/types/agent'
import type { Uuid } from '$lib/types/agent'

export const createExecution = (
	nodeId: Uuid,
	input: Record<string, unknown>,
	spec: Component
): Execution => {
	console.log('creating execution', nodeId, input, spec)
	const execution = {
		resource: 'execution/v1',
		input,
		spec: {
			spec,
			// Dummy data just for the backend to validate
			component_id: crypto.randomUUID(),
			component_version: 1
		}
	} satisfies Execution

	return execution
}
