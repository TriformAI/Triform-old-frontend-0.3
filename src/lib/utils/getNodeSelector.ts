import type { CanvasNode, Node, MetaNode } from '$lib/types/canvas'
import { defaultEdgeProps } from '$lib/types/canvas'
import type { XYPosition } from '@xyflow/svelte'
import type { Handle } from '@xyflow/system'

export function getNodeSelector(
	sourceId: Node['id'],
	position: XYPosition,
	fromNode: CanvasNode,
	fromHandle: Handle
) {
	const nodeId = crypto.randomUUID()

	// If dragging from a target handle (top of node), reverse the connection
	// The edge should go from selector's source to the node's target
	const isFromTargetHandle = fromHandle.type === 'target'

	const edge = {
		source: isFromTargetHandle ? nodeId : sourceId,
		sourceHandle: isFromTargetHandle ? undefined : fromHandle.id,
		target: isFromTargetHandle ? sourceId : nodeId,
		targetHandle: isFromTargetHandle ? fromHandle.id : undefined,
		id: `${sourceId}:${nodeId}`,
		data: { props: defaultEdgeProps }
	}

	const node = {
		id: nodeId,
		type: `selector-node`,
		position,
		data: {
			sourceNodeId: sourceId,
			sourceIsParent: fromNode.type === 'input-node',
			sourceNode: fromNode,
			sourceHandle: fromHandle
		},
		// set the origin of the new node so it is centered
		origin: [0.5, 0.0]
	} satisfies MetaNode

	return {
		node,
		edge
	}
}
