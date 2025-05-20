import { setNodes, setEdges, getNodes, getEdges } from '$lib/stores/canvas.svelte'
import type { Uuid } from '$lib/types/agent'
import type { Node, TemporaryNode, Edge } from '$lib/types/flow'
import type { XYPosition } from '@xyflow/svelte'

interface Params {
	type: 'selector' | 'loading' | 'parent'
	position: XYPosition
	nodeId?: Node['id']
	sourceNodeId?: Uuid
	sourceIsParent: boolean
	edge: Edge
}

export const addTemporaryNode = ({
	type,
	position,
	nodeId = crypto.randomUUID(),
	sourceNodeId,
	sourceIsParent,
	edge
}: Params) => {
	const newNode: TemporaryNode = {
		id: nodeId,
		type: `${type}-node`,
		position,
		data: { sourceNodeId, sourceIsParent, props: {} },
		// set the origin of the new node so it is centered
		origin: [0.5, 0.0]
	}

	setNodes([...getNodes(), newNode])
	setEdges([...getEdges(), edge])

	return {
		id: newNode.id,
		node: newNode
	}
}
