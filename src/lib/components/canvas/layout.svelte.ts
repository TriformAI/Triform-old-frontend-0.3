import type { Node } from '$lib/types/flow'
import type { Edge } from '@xyflow/svelte'
import dagre from '@dagrejs/dagre'
import { Position } from '@xyflow/svelte'

const NODE_SIZE = 80

export const getLayoutedNodes = async (nodes: Node[], edges: Edge[]) => {
	const graph = new dagre.graphlib.Graph()
	graph.setDefaultEdgeLabel(() => ({}))
	graph.setGraph({
		rankdir: 'TB',
		nodesep: 60,
		ranksep: 80
	})

	nodes = nodes.sort((a, b) => a.id.localeCompare(b.id))
	edges = edges.sort((a, b) => {
		const sourceComp = a.source.localeCompare(b.source)
		if (sourceComp !== 0) {
			return sourceComp
		}
		return a.target.localeCompare(b.target)
	})

	for (const node of nodes) {
		graph.setNode(node.id, {
			width: NODE_SIZE,
			height: NODE_SIZE
		})
	}
	for (const edge of edges) {
		graph.setEdge(edge.source, edge.target)
	}

	dagre.layout(graph, {
		disableOptimalOrderHeuristic: true
	})

	const layoutedNodes = nodes.map(node => {
		const positionedNode = graph.node(node.id)
		node.targetPosition = Position.Top
		node.sourcePosition = Position.Bottom
		// svelte flow anchors at top-left, but dagre at center, so we need to update the position to match
		return Object.assign(node, {
			position: {
				x: positionedNode.x - NODE_SIZE / 2,
				y: positionedNode.y - NODE_SIZE / 2
			}
		})
	})

	// Center the nodes on the canvas
	const maxX = Math.max(...layoutedNodes.map(n => n.position.x))
	const maxY = Math.max(...layoutedNodes.map(n => n.position.y))
	const minX = Math.min(...layoutedNodes.map(n => n.position.x))
	const minY = Math.min(...layoutedNodes.map(n => n.position.y))

	const centerX = (maxX + minX) / 2
	const centerY = (maxY + minY) / 2

	layoutedNodes.forEach(node => {
		node.position.x -= centerX
		node.position.y -= centerY
	})

	// Fit the groups
	return layoutedNodes
}
