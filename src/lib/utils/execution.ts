import type { Node } from '$lib/types/flow'
import type { Uuid, Flow } from '$lib/types/agent'
import type { Execution } from '$lib/types/execution'

import { getDownstreamNodes } from '$lib/stores/canvas.svelte'

export const createExecution = (node: Node, input: Record<string, unknown>): Execution => {
	const { spec } = node.data
	let execution: Execution
	if (spec.resource === 'endpoint/v1') {
		// If it's an endpoint, we need to find all downstream nodes and wrap them all in a flow
		const downstreamNodes = [...getDownstreamNodes(node.id)]
		const flow: Flow = {
			resource: 'flow/v1',
			// Dummy data for backend
			meta: {
				name: `${spec.meta.name} (v${spec.meta.version}) Execution`,
				id: crypto.randomUUID(),
				version: 1
			},
			spec: {
				readme: 'Execution of endpoint',
				nodes: Object.fromEntries(
					downstreamNodes.map(n => [
						n.id,
						{
							component_id: n.data.component_id,
							component_version: n.data.component_version,
              inputs: n.data.inputs ?? ['parent'],
							spec: n.data.spec
						}
					])
				),
				// For now we'll just use the last node in the chain
				// (ie the one that is in no other node's inputs array)
				outputs: downstreamNodes
					.filter(n => !downstreamNodes.some(n2 => (n2.data.inputs ?? []).includes(n.id)))
					.map(n => n.id)
			}
		}

		execution = {
			resource: 'execution/v1',
			input,
			spec: {
				spec: flow,
				// Dummy data just for the backend to validate
				component_id: crypto.randomUUID(),
				component_version: 1
			}
		}
	} else {
		// If it's just a regular action/flow, we can execute it immediately
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
