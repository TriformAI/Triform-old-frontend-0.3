import { getNodes } from '$lib/stores/canvas.svelte'
import { type UUID as Uuid } from 'crypto'
import { type Node } from '$lib/types'

export function getDownstreamNodes(id: Uuid): Set<Node> {
	let downstreamNodes = new Set<Node>()
	for (const node of getNodes()) {
		if (node.data.trinode.inputs?.includes(id)) {
			downstreamNodes.add(node)
			const nestedNodes = getDownstreamNodes(node.id)
			downstreamNodes = downstreamNodes.union(nestedNodes)
		}
	}
	return downstreamNodes
}
