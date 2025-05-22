import type { Node } from '$lib/types/flow'
import type { Execution } from '$lib/types/execution'

export const createExecution = (node: Node, input: Record<string, unknown>): Execution => {
	console.log('creating execution', node, input)
	const execution = {
		resource: 'execution/v1',
		input,
		spec: {
			spec: node.data.trinode.spec,
			// Dummy data just for the backend to validate
			component_id: crypto.randomUUID(),
			component_version: 1
		}
	} satisfies Execution

	return execution
}
