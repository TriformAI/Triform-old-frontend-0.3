import { type Component, isFlow } from '$lib/types/agent'

// Recursively returns all the nodes in a flow
export function getNodes(node: Component): Component[] {
	const nodes: Component[] = []
	if (!isFlow(node)) return nodes
	for (const child of Object.values(node.spec.nodes))
		nodes.push(child.spec, ...getNodes(child.spec))

	return nodes
}
