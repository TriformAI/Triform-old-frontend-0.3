import {
	type IsValidConnection as IsValidConnectionType,
	type useSvelteFlow,
	getOutgoers
} from '@xyflow/svelte'
import type { Node } from '$lib/types/canvas'

export const isValidConnection: AddParameters<
	IsValidConnectionType,
	[ReturnType<typeof useSvelteFlow>]
> = (connection, _useSvelteFlow) => {
	// don't allow connections between ghost ports
	if (connection.sourceHandle?.startsWith('ghost-') && connection.targetHandle?.startsWith('ghost-')) return false

	// don't allow connections that pass through flows
	if (
		(connection.source?.endsWith(':input') && connection.target?.endsWith(':output')) ||
		(connection.source?.endsWith(':output') && connection.target?.endsWith(':input'))
	) return false

	// no self-loops
	if (connection.target === connection.source) return false
	// prevent cycles with union find
	const { getNodes, getEdges } = _useSvelteFlow
	const nodes = getNodes()
	const edges = getEdges()
	const hasCycle = (node: Node, visiting: Set<Node['id']>, visited: Set<Node['id']>) => {
		if (visiting.has(node.id)) return true // Found a cycle - node is in current path
		if (visited.has(node.id)) return false // Already processed this node completely
		
		visiting.add(node.id)
		const outgoers = getOutgoers(node, nodes, edges)
		for (const out of outgoers)
			if (out.id === connection.source || hasCycle(out as Node, visiting, visited)) return true
		visiting.delete(node.id) // Remove from current path
		visited.add(node.id) // Mark as completely processed
		return false
	}
	const targetNode = nodes.find(n => n.id === connection.target)
	if (!targetNode) return false
	return !hasCycle(targetNode as Node, new Set(), new Set())
}
