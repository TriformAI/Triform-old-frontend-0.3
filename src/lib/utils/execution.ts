import type { Node } from '$lib/types/flow'
import type { Uuid, Flow } from '$lib/types/agent'

// import { getDownstreamNodes } from '$lib/stores/canvas.svelte'
import type { Execution } from '$lib/types/execution'

export const createExecution = (node: Node, input: Record<string, unknown>): Execution => {
	const { spec } = node.data
	let execution: Execution
	// If it's an endpoint, we need to find all downstream nodes and wrap them all in a flow
	if (spec.resource === 'endpoint/v1') {
		// const downstreamNodes = getDownstreamNodes(node.id)
		// const agent: Agent = {
		//   resource: 'agent/v1',
		//   meta: {
		//     name: `${spec.meta.name} (v${spec.meta.version}) Execution`,
		//     id: crypto.randomUUID(),
		//     version: 1
		//   },
		//   spec: {
		//     readme: 'Execution of endpoint',
		//     nodes: downstreamNodes.
		//   }
		// }

		// temp:
		execution = {
			resource: 'execution/v1',
			input,
			spec: {
				component_id: spec.meta.id,
				component_version: spec.meta.version
			}
		}
	}
	// If it's just a regular action/flow, we can execute it immediately
	else {
		execution = {
			resource: 'execution/v1',
			input,
			spec: {
				spec: node.data.spec,
				// Dummy data just for the backend to validate
				component_id: crypto.randomUUID(),
				component_version: 1
			}
		}
	}

	return execution
}
