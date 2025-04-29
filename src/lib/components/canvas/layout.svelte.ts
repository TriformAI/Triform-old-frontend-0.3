import type { Node } from '$lib/types/flow'
import type { Edge } from '@xyflow/svelte'
import type { ElkNode, ELK as ELKType } from 'elkjs'

import ELK from 'elkjs'

const padding = {
	x: 40,
	y: 80
}
const elkSettings = {
	'elk.direction': 'DOWN',
	'elk.algorithm': 'layered',
	'elk.edgeRouting': 'SPLINES',
	'elk.padding': `[top=${padding.y + 10},left=${padding.x},bottom=${padding.y},right=${padding.x}]`,
	'elk.spacing.nodeNode': '50',
	'elk.layered.spacing.edgeNodeBetweenLayers': '60',
	'elk.layered.spacing.nodeNodeBetweenLayers': '90',
	'elk.layered.considerModelOrder.strategy': 'PREFER_NODES',
	'elk.layered.considerModelOrder.components': 'MODEL_ORDER',
	'elk.alignment': 'CENTER',
	'elk.hierarchyHandling': 'INCLUDE_CHILDREN'
}

const NODE_SIZE = 80

let elk: ELKType

type NodeTypeMap = Record<Node['id'], Node['type']>

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
	edges: Edge[],
	nodeTypes: NodeTypeMap
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

	// If it's an open flow, but without any children, default to a set width & height so the node selector fits
	console.log(node.id, childNodes.length, nodeTypes[node.id as Node['id']])
	if (!childNodes.length && nodeTypes[node.id as Node['id']] === 'open-flow-node') {
		console.log('empty at', node.id)
		return {
			width: NODE_SIZE * 3,
			height: NODE_SIZE * 3
		}
	}

	const { width = NODE_SIZE, height = NODE_SIZE } = await elk.layout(graph)
	return { width, height }
}

// Calculate the sizes of all groups
const updateGroupSizes = async (
	node: ElkNode,
	edges: Edge[],
	nodeTypes: NodeTypeMap
): Promise<ElkNode> => {
	if (!node.children?.length) {
		// If it's an open flow, but without any children, default to a set width & height so the node selector fits
		if (nodeTypes[node.id as Node['id']] === 'open-flow-node') {
			return {
				...node,
				width: NODE_SIZE * 2,
				height: NODE_SIZE * 2
			}
		}
		// otherwise, just return the node as usual
		return node
	}

	// Process children first
	const processedChildren = await Promise.all(
		node.children.map(async n => await updateGroupSizes(n, edges, nodeTypes))
	)

	// Calculate the new dimensions once the children have been processed
	const { width, height } = await calculateGroupDimensions(
		node,
		processedChildren,
		edges,
		nodeTypes
	)

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
	const nodeTypes: NodeTypeMap = Object.fromEntries(nodes.map(n => [n.id, n.type]))
	console.time('update group sizes')
	children = await Promise.all(children.map(c => updateGroupSizes(c, filteredEdges, nodeTypes)))
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

	console.time('layout elk')
	const layout = await elk.layout(graph)
	console.timeEnd('layout elk')
	const flattenedTree = flattenElkTree(layout).filter(n => n.id !== 'root') ?? []
	const layoutedNodes: Node[] = flattenedTree.map(n => {
		const node = nodes.find(node => node.id === n.id)
		if (!node) throw new Error('Could not find node with id ' + n.id)

		Object.assign(node, {
			position: {
				x: n.x ?? 0,
				y: n.y ?? 0
			},
			width: n.width,
			height: n.height
		})
		return node
	})

	// Fit the groups
	return layoutedNodes
}
