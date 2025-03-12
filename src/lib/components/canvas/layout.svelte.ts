import type { Node } from '$lib/types/flow'
import type { Edge } from '@xyflow/svelte'
import type { ElkNode, ELK as ELKType } from 'elkjs'

import ELK from 'elkjs'

const elkSettings = {
	'elk.direction': 'DOWN',
	'elk.algorithm': 'layered',
	'elk.edgeRouting': 'SPLINES',
	'elk.padding': '[top=60,left=50,bottom=60,right=50]',
	'elk.spacing.nodeNode': '150',
	'elk.layered.spacing.edgeNodeBetweenLayers': '50',
	'elk.layered.spacing.nodeNodeBetweenLayers': '60',
	'elk.layered.considerModelOrder.strategy': 'PREFER_NODES',
	'elk.layered.considerModelOrder.components': 'MODEL_ORDER',
	'elk.alignment': 'CENTER'
}

const NODE_SIZE = 80

let elk: ELKType

const buildElkTree = (allNodes: Node[]): ElkNode[] => {
	// First get all root nodes (nodes without a parent)
	const rootNodes = allNodes.filter(node => !node.parentId)

	// Then build the tree recursively starting from root nodes
	const buildTree = (nodes: Node[]): ElkNode[] => {
		return nodes.map(node => {
			const children = allNodes.filter(
				n =>
					n.parentId === node.id &&
					// prevent recursion
					n.id !== node.id
			)
			const nodeSize = NODE_SIZE
			return {
				id: node.id,
				width: nodeSize,
				height: nodeSize,
				layoutOptions: elkSettings,
				children: buildTree(children)
			}
		})
	}

	return buildTree(rootNodes)
}

// Calculate the group dimensions by laying out all children
const calculateGroupDimensions = async (
	node: ElkNode,
	childNodes: ElkNode[],
	edges: Edge[]
): Promise<{
	width: number
	height: number
}> => {
	// Nodes are always NODE_SIZE x NODE_SIZE (this should not be hardcoded, need to figure out where its coming from...)
	if (!childNodes.length) return { width: NODE_SIZE, height: NODE_SIZE }

	// Create an elk graph with the node and all its children, and lay it out
	// which will calculate the correct dimensions of the group
	const nodeIds = childNodes.map(n => n.id).concat(node.id)
	const relevantEdges = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target))
	const graph = {
		id: node.id,
		layoutOptions: elkSettings,
		children: childNodes,
		edges: relevantEdges.map(e => ({
			id: e.id,
			sources: [e.source],
			targets: [e.target]
		}))
	}
	const { width = NODE_SIZE, height = NODE_SIZE } = await elk.layout(graph)
	return { width, height }
}

// Calculate the sizes of all groups
const updateGroupSizes = async (node: ElkNode, edges: Edge[]): Promise<ElkNode> => {
	if (!node.children?.length) return node

	// Process children first
	const processedChildren = await Promise.all(
		node.children.map(async n => await updateGroupSizes(n, edges))
	)

	// Calculate the new dimensions once the children have been processed
	const { width, height } = await calculateGroupDimensions(node, processedChildren, edges)

	return {
		...node,
		children: processedChildren,
		width,
		height
	}
}

const flattenElkTree = (node: ElkNode): ElkNode[] =>
	node.children?.length ? [node, ...node.children.flatMap(flattenElkTree)] : [node]

export const getLayoutedNodes = async (nodes: Node[], edges: Edge[]) => {
	// Elk instance needs to be created on the client
	if (!elk) elk = new ELK()
	// console.clear()

	console.time('build tree')
	let children = buildElkTree(nodes)
	console.timeEnd('build tree')

	// Remove our internal input/output edges for flows, as their source & destination don't
	// really exist in elk, since they're just handles and not actual nodes. Another reason is that they
	// exist on the parent flow, and since we do the layouting bottom-up, we don't have access to the parent
	// flow from within its children (usually)
	const flowInputOutputRegex = /.+:(out|in)put$/
	const filteredEdges = edges.filter(
		e =>
			!flowInputOutputRegex.test(e.sourceHandle ?? '') &&
			!flowInputOutputRegex.test(e.targetHandle ?? '')
	)

	// Go through the graph in a post-order fashion to calculate the correct size of all groups
	console.time('update group sizes')
	children = await Promise.all(children.map(c => updateGroupSizes(c, filteredEdges)))
	console.timeEnd('update group sizes')

	const graph = {
		id: 'root',
		layoutOptions: elkSettings,
		children,
		edges: filteredEdges.map(e => ({
			id: e.id,
			sources: [e.source],
			targets: [e.target]
		}))
	}

	console.log(graph.edges)

	console.time('layout elk')
	const layout = await elk.layout(graph)
	console.timeEnd('layout elk')
	console.time('flatten elk tree')
	const flattenedTree = flattenElkTree(layout).filter(n => n.id !== 'root') ?? []
	console.timeEnd('flatten elk tree')
	const layoutedNodes: Node[] = flattenedTree.map(n => {
		const node = nodes.find(node => node.id === n.id)
		if (!node) throw new Error('Could not find node with id ' + n.id)

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
}
