import type {
	Node as TriNode, // as to not conflict with Node (used for @xyflow/svelte)
	Flow,
	Action,
	Uuid
} from '$lib/types/agent'
import { defaultProps } from '$lib/types/flow'
import type { Project } from '$lib/types/project'
import type { Node, TemporaryNode } from '$lib/types/flow'
import { type Edge } from '@xyflow/svelte'
import { filterInPlace } from '$lib/utils/filterInPlace'
import { arraysDiffer } from '$lib/utils/arraysDiffer'
import { writable } from 'svelte/store'

export const nodes = $state<Record<Uuid, Node>>({})
export const edges = $state<Edge[]>([])

export const selected = {
	get node() {
		return Object.values(nodes).filter(node => node.selected)[0]
	},

	get isMultiple() {
		return Object.values(nodes).filter(node => node.selected).length > 1
	},

	get isDirty() {
		if (!this.node) {
			return false
		}

		return this.node.data.props.isDirty
	},

	get openPanel() {
		if (!this.node) {
			return ''
		}

		return this.node.data.props.openPanel
	}
}

export function setIsDirty(nodeId: Uuid, val: boolean) {
	if (!nodes[nodeId]) return
	nodes[nodeId].data.props.isDirty = val
}

export function setOpenPanel(nodeId: Uuid, val: string) {
	if (!nodes[nodeId]) return
	nodes[nodeId].data.props.openPanel = val
}

// Whenever the nodes store changes, auto layout everything
// Also used for updating the writable store that svelte flow requires
export const nodesStore = writable<(Node | TemporaryNode)[]>([])
export const edgesStore = writable<Edge[]>([])

// ideally mostly just used for metadata
// but also for updating top-level nodes, so we can basically just
// serialize this when we need to save the full project (quite rare)
let currentProject = $state<Project>()
export const project = () => currentProject

// Whenever updateNode is ran, these listeners will trigger
// Primarily used to propogate updates to svelte flow's internals
const updateNodeListeners = $state<Map<Uuid, (id: Uuid) => void>>(new Map())
export const registerUpdateNodeListener = (listener: (id: Uuid) => void) => {
	const id = crypto.randomUUID()
	updateNodeListeners.set(id, listener)
	return () => {
		updateNodeListeners.delete(id)
	}
}

const parseNode = (
	node: TriNode,
	id: Uuid,
	parentId?: Uuid
): {
	node: Node
	edges: Edge[]
} => {
	let newNode: Node
	const newEdges: Edge[] = []

	for (const input of node.inputs ?? []) {
		// Flow inputs
		if (input === 'parent') {
			if (!parentId) continue
			newEdges.push({
				id: `${id}:${parentId}:input`,
				source: parentId,
				sourceHandle: `${parentId}:input`,
				target: id
			})
			continue
		}
		// Normal edges
		newEdges.push({
			id: `${id}:${input}`,
			source: input,
			// Force it to connect to the right handle and not just the first one
			sourceHandle: input,
			target: id
		})
	}

	const pathHistory = parentId ? (nodes[parentId].data.path as Uuid[]) : []

	const data = {
		trinode: node,
		props: { ...defaultProps },
		path: [...pathHistory, id]
	}

	if (isAction(node)) {
		newNode = {
			id,
			type: 'action-node',
			parentId,
			draggable: false,
			position: { x: 0, y: 0 },
			extent: parentId ? 'parent' : undefined,
			data: { ...data }
		}
	} else if (isFlow(node)) {
		newNode = {
			id,
			type: 'flow-node',
			draggable: false,
			position: { x: 0, y: 0 },
			parentId,
			extent: parentId ? 'parent' : undefined,
			data: { ...data, isExpanded: false }
		}

		// Add edges for the flow outputs
		for (const source of node.spec.spec.outputs) {
			newEdges.push({
				id: `${source}:${id}:output`,
				source,
				target: id,
				targetHandle: `${id}:output`
			})
		}
	} else if (isEndpoint(node)) {
		newNode = {
			id,
			type: 'endpoint-node',
			dragHandle: undefined,
			style: undefined,
			draggable: false,
			position: { x: 0, y: 0 },
			parentId,
			extent: parentId ? 'parent' : undefined,
			data: { ...data }
		}
	} else throw new Error(`Unknown node type ${node.resource}`)

	return {
		node: newNode,
		edges: newEdges
	}
}

export const parseNodes = (nodes: Record<Uuid, TriNode>, parentId?: Uuid) =>
	Object.entries(nodes)
		.map(([id, node]) => parseNode(node, id as Uuid, parentId))
		.reduce(
			(acc, curr) => ({ nodes: [...acc.nodes, curr.node], edges: [...acc.edges, ...curr.edges] }),
			{
				nodes: [] as Node[],
				edges: [] as Edge[]
			}
		)

export const loadProject = (project: Project) => {
	console.log('loading project', project)
	if (!project?.spec?.nodes) return

	// Load in the top-level nodes
	const { nodes: parsedNodes, edges: parsedEdges } = parseNodes(project.spec.nodes)

	for (const node of parsedNodes) {
		nodes[node.id] = node
	}

	edges.push(...parsedEdges)
	currentProject = project
}

export const unloadProject = () => {
	for (const prop of Object.getOwnPropertyNames(nodes)) delete nodes[prop as Uuid]
	edges.length = 0
	currentProject = undefined
}

// Expands a single flow node, adding its children to the canvas
export const expandFlow = (id: Uuid) => {
	const parent = nodes[id]
	if (!parent || !isFlow(parent.data.trinode) || parent.data.isExpanded) return

	const { nodes: parsedNodes, edges: parsedEdges } = parseNodes(
		parent.data.trinode.spec.spec.nodes,
		id
	)

	// Replace the closed flow node w/ the open one instead
	const oldNode = nodes[id]

	if (!oldNode) {
		return
	}

	Object.assign(oldNode, {
		type: 'open-flow-node',
		data: {
			...oldNode.data,
			isExpanded: true
		}
	})

	// Add all the new child nodes to the canvas
	for (const node of parsedNodes) nodes[node.id] = node
	edges.push(...parsedEdges)

	// Add the edges for the parent flow as well (the output are defined on the parent)
	const { edges: parentEdges } = parseNode(parent.data.trinode, id, parent.parentId)
	const currentEdges = new Set($state.snapshot(edges).map(e => e.id))
	edges.push(...parentEdges.filter(e => !currentEdges.has(e.id)))
}

// Collapses a single flow node, removing its children from the canvas
export const collapseFlow = (id: Uuid) => {
	let parent = nodes[id]
	if (!parent || !isFlow(parent.data.trinode) || !parent.data.isExpanded) return

	// Delete all the children from the canvas
	const children = Object.keys(parent.data.trinode.spec.spec.nodes)
	for (const childId of children) {
		delete nodes[childId as Uuid]
		filterInPlace(edges, e => e.source !== childId && e.target !== childId)
	}

	// Replace the open flow node w/ the closed one instead
	parent = nodes[id]

	Object.assign(nodes[id], {
		type: 'flow-node',
		data: {
			...parent.data,
			isExpanded: false
		}
	})
}

// Updates only the TriNode data of a node
// We can't use DeepPartial because we store nodes in an object, and assigning
// that won't let us remove properties, so better to just pass in the full data
export const updateNode = (id: Uuid, updatedNode: TriNode): TriNode => {
	const node = nodes[id]
	if (!node) throw new Error(`Tried to update non-existent node ${id}`)

	const previous = structuredClone($state.snapshot(node.data.trinode))

	Object.assign(node, {
		...node,
		data: {
			...node.data,
			trinode: updatedNode
		}
	})

	// Check if we need to modify the edges in any way
	if (
		arraysDiffer(previous.inputs ?? [], updatedNode.inputs ?? []) ||
		(isFlow(previous) &&
			isFlow(updatedNode) &&
			arraysDiffer(previous.spec.spec.outputs ?? [], updatedNode.spec.spec.outputs ?? []))
	) {
		// Replace the old edges with the new ones
		// This could probably be optimised further by only replacing the edges that have actually changed
		const { edges: oldEdges } = parseNode(previous, id, node.parentId)
		const { edges: newEdges } = parseNode(updatedNode, id, node.parentId)
		const oldEdgeIds = oldEdges.map(e => e.id)
		filterInPlace(edges, e => !oldEdgeIds.includes(e.id))
		edges.push(...newEdges)
	}

	// Trigger an update in svelte flow's internals
	for (const listener of updateNodeListeners.values()) listener(id)

	// If it was a top-level node, keep the project in sync
	const proj = project()
	if (!proj?.spec) throw new Error('Project does not exist')
	if (id in proj.spec.nodes) {
		proj.spec.nodes[id] = updatedNode
	}

	// Return the previous node so we can revert if needed
	return previous
}

// Adds a child to a flow
export const addChild = (
	parentId: Uuid | 'project' = 'project',
	child: TriNode,
	childId_?: Uuid
) => {
	const childId = childId_ ?? crypto.randomUUID() // fallback to random id if none was provided
	if (parentId === 'project') {
		const { node: parsedNode, edges: parsedEdges } = parseNode(child, childId)
		nodes[childId] = parsedNode
		edges.push(...parsedEdges)
		// update project
		const proj = project()
		if (!proj?.spec) throw new Error('Project does not exist')
		proj.spec.nodes[childId] = child
	} else {
		// Adding a child to a flow
		const parent = nodes[parentId]

		if (!parent || !isFlow(parent.data.trinode))
			throw new Error('Parent does not exist or is not a flow')

		parent.data.trinode.spec.spec.nodes[childId] = child
		updateNode(parentId, parent.data.trinode)
		// If the parent was expanded, we need to add the child as well
		const { node: parsedNode, edges: parsedEdges } = parseNode(child, childId, parentId)
		nodes[childId] = parsedNode
		edges.push(...parsedEdges)
	}
}

export const removeChild = (childId: Uuid) => {
	const child = nodes[childId]
	if (!child) throw new Error(`Tried to remove non-existent node ${childId}`)

	// Store the previous states of all nodes so we can revert them if needed
	const updatedNodes = new Map()

	const parentId = child.parentId

	// Remove all the edges that have anything to do with this node
	// TODO: make it smarter (again) so it jumps edges when removing
	// we can copy the code that I wrote the last time (but keeping it simple for now)
	filterInPlace(edges, e => e.source !== childId && e.target !== childId)

	let parent = parentId ? $state.snapshot(nodes[parentId]) : undefined
	if (parent && !isFlow(parent.data.trinode)) {
		throw new Error(`Child ${childId} does not have a flow as a parent`)
	}
	// Clone it so we don't modify the original before we commit the updates with updateNode
	parent = structuredClone(parent)
	// Find all nodes that used to depend on this node and change their inputs
	// to this node's old input instead
	// For now we can probably assume that all eventual dependencies are siblings, as we
	// don't allow inter-flow connections (yet)
	const possibleDependencies: [string, TriNode][] = parent
		? // If parent is a flow, just use the nodes in the flow
			Object.entries((parent.data.trinode.spec as Flow).spec.nodes)
		: // If it's a top-level node, use the other top-level nodes in the project
			Object.entries(nodes)
				.filter(([_id, n]) => !n.parentId)
				.map(([id, n]) => [id, n.data.trinode])
	for (const [nodeId, node] of possibleDependencies) {
		if (node.inputs?.includes(childId)) {
			node.inputs = node.inputs.flatMap(input =>
				input === childId ? (child.data.trinode.inputs ?? []) : input
			)
			const previous = updateNode(nodeId as Uuid, node)
			updatedNodes.set(nodeId as Uuid, previous)
		}
	}

	if (
		!parent ||
		// pleasing typescript:
		!parentId
	) {
		// If there's no parent, it's a top-level project node
		delete nodes[childId]
		const proj = project()
		if (!proj?.spec) throw new Error('Project does not exist')
		delete proj.spec.nodes[childId]
	} else {
		// Part of a flow
		if (!parent || !isFlow(parent.data.trinode)) {
			throw new Error(`Tried to remove non-existent node ${childId}`)
		}

		// If the node used to be connected to the output, we need to connect its old inputs to the output
		const outputs = parent.data.trinode.spec.spec.outputs
		if (outputs.includes(childId)) {
			filterInPlace(outputs, o => o !== childId)

			const inputs = (child.data.trinode.inputs ?? []).filter(i => i !== 'parent')
			parent.data.trinode.spec.spec.outputs = [...new Set([...outputs, ...inputs])]
		}

		delete parent.data.trinode.spec.spec.nodes[childId]
		const previous = updateNode(parentId, parent.data.trinode)
		updatedNodes.set(parentId, previous)
		delete nodes[childId]
	}

	return updatedNodes
}

const isEndpoint = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'endpoint/v1'
const isAction = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'action/v1'
export const isFlow = (node: TriNode): node is TriNode & { spec: Flow } =>
	node.spec.resource === 'flow/v1'
