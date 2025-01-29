import type { Edge, Node } from '@xyflow/svelte'
import type { ElkNode } from 'elkjs'

import ELK from 'elkjs'

const elkSettings = {
	'elk.direction': 'DOWN',
	'elk.algorithm': 'layered',
	'elk.edgeRouting': 'SPLINES',
	'elk.padding': '[top=30,left=20,bottom=20,right=20]',
}

const buildElkTree = (nodes: Node[]): ElkNode[] => {
	// All open agents have nested children, so we need to build the children recursively
	return nodes.map(node => {
		const children = nodes.filter(n => n.parentId === node.id)
		const nodeSize = 44
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
		console.log('n', n, node, n.width, n.height)

		return {
			...node,
			position: {
				x: n.x ?? 0,
				y: n.y ?? 0
			},
			width: n.width,
			height: n.height
		}
	})

	// Fit the groups
	return layoutedNodes
		// .map(n => {
		// 	const children = layoutedNodes.filter(child => child.parentId === n.id)
		// 	if (!children.length) return n
		// 	console.log('children', children, children.map(c => c.position.y))
		// 	const nodeSize = 44
		// 	const getPos = (child: Node): { x: number; y: number }[] => {
		// 		const res = [{
		// 			x: child.position.x,
		// 			y: child.position.y
		// 		}]
		// 		// If it's an open agent, check all its children too
		// 		if (child.type === 'open-agent-node') {
		// 			const agentChildren = layoutedNodes.filter(n => n.parentId === child.id)
		// 			res.push(...agentChildren.flatMap(getPos).flatMap(p => ([
		// 				{ x: p.x + groupPadding, y: p.y + groupPadding },
		// 				{ x: p.x - groupPadding, y: p.y - groupPadding }
		// 			])))
		// 		}

		// 		return res
		// 	}
		// 	// TODO: benchmark this, with a few nodes it's <0.1ms but it might
		// 	// grow pretty badly due to the recursion
		// 	const childrenPos = children.flatMap(getPos)
		// 	const minX = Math.min(...childrenPos.map(p => p.x))
		// 	const maxX = Math.max(...childrenPos.map(p => p.x))
		// 	const minY = Math.min(...childrenPos.map(p => p.y))
		// 	const maxY = Math.max(...childrenPos.map(p => p.y))
		// 	const bounds = {
		// 		x: (maxX - minX) + nodeSize + groupPadding,
		// 		y: (maxY - minY) + nodeSize + groupPadding
		// 	}
		// 	n.width = bounds.x
		// 	n.height = bounds.y
		// 	return n
		// })
}