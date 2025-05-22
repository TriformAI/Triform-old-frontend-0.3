import {
	type IsValidConnection as IsValidConnectionType,
	type useSvelteFlow,
	getOutgoers
} from '@xyflow/svelte'
import type { Node } from '$lib/types/flow'

export const isValidConnection: AddParameters<
	IsValidConnectionType,
	[ReturnType<typeof useSvelteFlow>]
> = (connection, _useSvelteFlow) => {
	// no self-loops
	if (connection.target === connection.source) return false
	// prevent cycles with union find
	const { getNodes, getEdges } = _useSvelteFlow
	const nodes = getNodes()
	const edges = getEdges()
	const hasCycle = (node: Node, visited: Set<Node['id']>) => {
		if (visited.has(node.id)) return true
		visited.add(node.id)
		const outgoers = getOutgoers(node, nodes, edges)
		for (const out of outgoers) {
			if (out.id === connection.source || hasCycle(out as Node, visited)) return true
		}
	}
	const targetNode = nodes.find(n => n.id === connection.target)
	if (!targetNode) return false
	return !hasCycle(targetNode as Node, new Set())
}
