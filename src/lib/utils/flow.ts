import { nodes } from '$lib/stores/canvas.svelte'
import { type Uuid } from '$lib/types/agent'
import { type Node } from '$lib/types/flow'

export function getDownstreamNodes(id: Uuid): Set<Node> {
	let downstreamNodes = new Set<Node>()
	for (const node of Object.values(nodes)) {
		if (node.data.trinode.inputs?.includes(id)) {
			downstreamNodes.add(node)
			const nestedNodes = getDownStreamNodes(node.id)
			downstreamNodes = downstreamNodes.union(nestedNodes)
		}
	}
	return downstreamNodes
}
