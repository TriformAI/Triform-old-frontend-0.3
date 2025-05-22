import type { Node, TemporaryNode } from '$lib/types/flow'
import { defaultEdgeProps } from '$lib/types/flow'
import type { XYPosition } from '@xyflow/svelte'

export function getNodeSelector(
	sourceId: Node['id'],
	position: XYPosition,
	sourceIsParent: boolean
) {
	const nodeId = crypto.randomUUID()

	const edge = {
		source: sourceId,
		target: nodeId,
		id: `${sourceId}:${nodeId}`,
		data: { props: defaultEdgeProps }
	}

	const node = {
		id: nodeId,
		type: `selector-node`,
		position,
		data: {
			sourceNodeId: sourceId,
			sourceIsParent,
			props: {}
		},
		// set the origin of the new node so it is centered
		origin: [0.5, 0.0]
	} as TemporaryNode

	return {
		node,
		edge
	}
}
