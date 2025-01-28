import type { Edge, Node } from '@xyflow/svelte'
import type { ElkNode } from 'elkjs'

import ELK from 'elkjs'

const elkSettings = {
	'elk.direction': 'DOWN',
	'elk.algorithm': 'layered'
}

const buildElkTree = (nodes: Node[]): ElkNode[] => {
	// All open agents have nested children, so we need to build the children recursively
	const nodeSize = 80

	return nodes.map(node => {
		const children = nodes.filter(n => n.parentId === node.id)
		return {
			id: node.id,
			width: nodeSize,
			height: nodeSize,
			layoutOptions: elkSettings,
			children: buildElkTree(children)
		}
	})
}

export const getLayoutedNodes = async (nodes: Node[], edges: Edge[]) => {
	const elk = new ELK()

	const children = buildElkTree(nodes)

	const graph = {
		id: 'root',
		layoutOptions: elkSettings,
		children,
		edges: edges.map(e => ({
			id: e.id,
			sources: [e.source],
			targets: [e.target]
		}))
	}

	const layout = await elk.layout(graph)
	// For some reason the layout returns all children instead of just the first level
	// No idea why but I guess you shouldn't look a gift horse in the mouth, or something
	const layoutedNodes: Node[] = (layout.children ?? []).map(n => {
		const node = nodes.find(node => node.id === n.id)
		if (!node) throw new Error('Could not find node with id ' + n.id)
		console.log('n', n, node)

		return {
			...node,
			position: {
				x: n.x ?? 0,
				// Add some padding to the top if it's a child because the container label
				// takes up a bit of space
				y: (n.y ?? 0) + (node.parentId ? 5 : 0)
			}
		}
	})

	return layoutedNodes.map(n => {
		const children = layoutedNodes.filter(child => child.parentId === n.id)
		if (!children.length) return n
		console.log('children', children)
		const nodeSize = 44
		console.log('nodeSize', nodeSize)
		const bounds = {
			x:
				(Math.max(...children.map(n => n.position.x)) - Math.min(...children.map(n => n.position.x)))
				+ nodeSize,
			y:
				(Math.max(...children.map(n => n.position.y)) - Math.min(...children.map(n => n.position.y)))
				+ nodeSize
		}
		n.width = bounds.x
		n.height = bounds.y
		return n
	})
}