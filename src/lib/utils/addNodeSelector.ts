import { nodesStore, edgesStore } from '$lib/stores/canvas.svelte'
import type { Node, TemporaryNode } from '$lib/types/flow'
import type { Edge, XYPosition } from '@xyflow/svelte'

export const addNodeSelector = (
	edge: Edge,
	position: XYPosition,
	id?: Node['id'],
	addAsChild: boolean = false,
	parent?: Node['parentId']
) => {
	if (!id) id = crypto.randomUUID()

	const newNode: TemporaryNode = {
		id,
		type: 'selector-node',
		data: {
			addAsChild
		},
		parentId: parent,
		extent: parent ? 'parent' : undefined,
		position,
		// set the origin of the new node so it is centered
		origin: [0.5, 0.0]
	}

	nodesStore.update(n => [...n, newNode])
	edgesStore.update(n => [...n, edge])

	return {
		id,
		node: newNode
	}
}
