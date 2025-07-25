import type { Flow } from '$lib/types/resources'
import type { Node as TriNode } from '$lib/types'
import type { UUID as Uuid } from 'crypto'

export function getLeafNodes(node: Flow): Record<Uuid, TriNode> {
	const allNodes = Object.entries(node.spec.nodes)
	return Object.fromEntries(
		allNodes.filter(([id, _node]) => {
			// if no other nodes depend on this node, it's a leaf node
			return !allNodes.some(([_, otherNode]) => otherNode.inputs?.includes(id as Uuid))
		})
	)
}
