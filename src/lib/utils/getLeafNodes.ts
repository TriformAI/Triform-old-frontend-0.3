import type { Flow, Node as TriNode, Uuid } from '$lib/types/agent'

export function getLeafNodes(node: Flow): Record<Uuid, TriNode> {
	const allNodes = Object.entries(node.spec.nodes)
	return Object.fromEntries(
		allNodes.filter(([id, _node]) => {
			// if no other nodes depend on this node, it's a leaf node
			return !allNodes.some(([_, otherNode]) => otherNode.inputs?.includes(id as Uuid))
		})
	)
}
