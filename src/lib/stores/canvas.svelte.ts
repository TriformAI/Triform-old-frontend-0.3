import type {
	Node as TriNode, // as to not conflict with @xyflow/svelte
	Agent,
	Action,
	Uuid,
	Component
} from '$lib/types/agent'
import { writable, get } from 'svelte/store'
import type { Project } from '$lib/types/project'
import type { Node, NodeProps } from '$lib/types/flow'
import { type Edge } from '@xyflow/svelte'
import type { Node as FlowNode } from '$lib/types/flow'
import { SvelteMap } from 'svelte/reactivity'
import { API } from '$lib/api'

const api = new API()

export type ParsedGraph = {
	nodes: Node[]
	edges: Edge[]
}

// The currently shown resource should always be an agent
// The agent can have nested agents and actions, in sequence or parallel
export interface Canvas {
	project?: Project
	// Visual properties of the rendered nodes (frontend-only thing)
	nodeProps: SvelteMap<Uuid, NodeProps>
	hasUnsavedChanges: boolean
	// For when we want multiple tabs:
	// id: string,
	// label: string,
}

export const nodes = writable<FlowNode[]>([])
export const edges = writable<Edge[]>([])

const defaultProps: NodeProps = {
	expanded: false,
	deleted: false,
	creating: false
}

export const currentCanvas = $state<Canvas>({
	project: undefined,
	nodeProps: new SvelteMap(),
	hasUnsavedChanges: false
})

export const setNodeProps = (id: Uuid, props: Partial<NodeProps>) => {
	let propsRef = currentCanvas?.nodeProps.get(id)
	if (!propsRef) propsRef = defaultProps
	const newProps = Object.assign({}, propsRef, props)
	currentCanvas?.nodeProps.set(id, newProps)
}

export const getNodeProps = (id: Uuid): NodeProps | undefined => currentCanvas?.nodeProps.get(id)

const isEndpoint = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'endpoint/v1'
const isAction = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'action/v1'
const isAgent = (node: TriNode): node is TriNode & { spec: Agent } =>
	node.spec.resource === 'agent/v1'

export const parseProject = (project: Project) => {
	// Keep selected nodes even when re-parsing the project
	const selectedNodes = new Set(
		get(nodes)
			.filter(n => n.selected)
			.map(n => n.id)
	)
	const parseNode = (node: TriNode, id: Uuid, parentId?: Uuid): ParsedGraph => {
		const nodes: Node[] = []
		const edges: Edge[] = []

		for (const input of node.inputs ?? []) {
			if (input === 'parent') continue
			edges.push({
				id: `${id}:${input}`,
				source: input,
				target: id
			})
		}

		if (isAction(node)) {
			const isOpen = parentId && getNodeProps(parentId)?.expanded
			nodes.push({
				id,
				type: 'action-node',
				parentId,
				// Limits the movement to within the agent
				extent: isOpen ? 'parent' : undefined,
				draggable: false,
				position: { x: 0, y: 0 },
				selected: selectedNodes.has(id),
				data: {
					spec: node.spec,
					inputs: node.inputs,
					component_name: node.spec.meta.name,
					component_id: node.component_id,
					component_version: node.component_version ?? -1
				}
			})
		} else if (isAgent(node)) {
			const isOpen = getNodeProps(id)?.expanded
			nodes.push({
				id,
				type: isOpen ? 'open-agent-node' : 'agent-node',
				dragHandle: isOpen ? '.flow_drag-handle' : undefined,
				style: isOpen ? 'pointer-events: none' : undefined,
				selected: selectedNodes.has(id),
				position: { x: 0, y: 0 },
				parentId,
				extent: parentId ? 'parent' : undefined,
				data: {
					spec: node.spec,
					inputs: node.inputs,
					component_name: node.spec.meta.name,
					component_id: node.spec.meta.id,
					component_version: node.spec.meta.version
				}
			})

			if (!isOpen) return { nodes, edges }

			for (const [childId, child] of Object.entries(node.spec.spec.nodes)) {
				const { nodes: childNodes, edges: childEdges } = parseNode(child, childId as Uuid, id)
				nodes.push(...childNodes)
				edges.push(...childEdges)
			}
		} else if (isEndpoint(node)) {
			nodes.push({
				id,
				type: 'endpoint-node',
				dragHandle: undefined,
				style: undefined,
				draggable: false,
				selected: selectedNodes.has(id),
				position: { x: 0, y: 0 },
				parentId,
				extent: parentId ? 'parent' : undefined,
				data: {
					spec: node.spec,
					// can't have any inputs (for now)
					component_name: node.spec.meta.name,
					component_id: node.spec.meta.id,
					component_version: node.spec.meta.version
				}
			})
		} else throw new Error(`Unknown node type ${node.resource}`)

		return {
			nodes,
			edges
		}
	}

	return Object.entries(project.spec.nodes)
		.map(([id, node]) => parseNode(node, id as Uuid))
		.reduce(
			(acc, curr) => ({
				nodes: [...acc.nodes, ...curr.nodes],
				edges: [...acc.edges, ...curr.edges]
			}),
			{ nodes: [], edges: [] }
		)
}

export const loadProject = (project: Project, initialLoad: boolean) => {
	// Since we only support one tab for now, replace the entire store
	currentCanvas.project = project
	// Reset the node props
	if (initialLoad) currentCanvas.nodeProps.clear()

	console.log('Loaded project', project)
}

export const unloadProject = () => {
	currentCanvas.project = undefined
	currentCanvas.nodeProps.clear()
	currentCanvas.hasUnsavedChanges = false
}

export const saveProject = async () => {
	if (!currentCanvas.project) return

	// TODO: make this return the fully resolved project so we can reload the local representation
	const newProject = await api.put<Project>(
		`projects/${currentCanvas.project.meta.id}`,
		currentCanvas.project
	)
	// Load new project without resetting visual props
	// loadProject(newProject, false)
	console.log('saved project', newProject)
	currentCanvas.hasUnsavedChanges = false
}

// Generic function for applying a function to some node in the canvas
const processNode = async (
	id: Uuid,
	fn: (node: TriNode, nodeId?: Uuid) => Promise<Partial<TriNode> | undefined>
) => {
	let updatedNode: TriNode | undefined = undefined
	const process = async (node: TriNode, nodeId: Uuid) => {
		if (nodeId === id) {
			Object.assign(node, await fn(node, nodeId))
			updatedNode = node
			return
		}

		if (isAgent(node)) {
			if (!('spec' in node)) return
			for (const [childId, child] of Object.entries(node.spec.spec.nodes))
				await process(child, childId as Uuid)
		}
		// Currently we only support updating children of agents so don't do anything else here
	}

	for (const [nodeId, node] of Object.entries(currentCanvas.project?.spec.nodes ?? {})) {
		await process(node, nodeId as Uuid)
	}

	return updatedNode
}

export const updateNode = async (id: Uuid, updatedNode: Partial<TriNode>) => {
	currentCanvas.hasUnsavedChanges = true
	return await processNode(id, async () => updatedNode)
}

export async function addDownstreamNode(
	parentId: Uuid | 'root' = 'root',
	newNode?: TriNode,
	sourceId?: Uuid
) {
	if (!currentCanvas.project) return
	const nodeId = self.crypto.randomUUID()

	if (!newNode) {
		const componentId = crypto.randomUUID() // placeholder for sake of validation
		newNode = {
			component_id: componentId,
			component_version: 1,
			inputs: sourceId ? [sourceId] : [],
			spec: {
				resource: `action/v1`,
				meta: {
					name: 'Action',
					id: componentId,
					version: 1
				},
				spec: {
					source: '@triform.entrypoint\ndef action(input):\n  return input',
					readme: '',
					deps: '',
					streaming: false
				}
			}
		}
	}

	if (parentId === 'root') {
		currentCanvas.project.spec.nodes[nodeId] = newNode!

		// If we created a brand new empty node, we need to create it as a component
		// (this is the only case for now, but eventually we'll allow users to create nodes from components)
		try {
			setNodeProps(nodeId, { creating: true })
			console.log('creating component', newNode.spec)
			const newComponent = await api.post<Component>('components', newNode.spec)
			// Update the component id locally now that we have the real ID generated by the backend
			currentCanvas.project.spec.nodes[nodeId].component_id = newComponent.meta.id
			currentCanvas.project.spec.nodes[nodeId].spec.meta.id = newComponent.meta.id
			setNodeProps(nodeId, { creating: false })
			currentCanvas.hasUnsavedChanges = true
		} catch (e) {
			console.error('Failed to create component', e)
			// If it failed, remove the node from the project
			removeNode(nodeId)
		}
	}

	return currentCanvas.project.spec.nodes[nodeId]
}

// Adds a child node to a specific parent node
export const addChild = async (parentId: Uuid | 'root', child: TriNode, nodeId: Uuid) => {
	if (!currentCanvas.project) return
	// If the parentId is "root", add it to the project as a root level node
	if (parentId === 'root') {
		currentCanvas.project.spec.nodes[nodeId] = child
	} else {
		// Otherwise, find the right parent to add the child to
		await processNode(parentId, async node => {
			// If the parent isn't an agent, we can't add children to it
			// TODO: when we encounter this case, wrap the parent in an agent first
			if (!isAgent(node)) {
				console.error('Not an agent!')
				return
			}
			node.spec.spec.nodes[nodeId] = child
			return node
		})
	}
	currentCanvas.hasUnsavedChanges = true
}

// TODO: make this update a local tree or something first before committing
// to the real one, since this will trigger quite a few layouts of the
// rendered tree, basically every time we update a node
export const removeNode = async (id: Uuid) => {
	if (!currentCanvas.project) return
	// If it's a root node, remove it
	if (currentCanvas.project.spec.nodes[id]) {
		const nodeToDelete = currentCanvas.project.spec.nodes[id]
		// Update all the nodes that depended on this node
		for (const [nodeId, node] of Object.entries(currentCanvas.project.spec.nodes)) {
			if (node.inputs?.includes(id)) {
				// Any node with the old node as parent, should instead get the old nodes parent(s)
				node.inputs = node.inputs?.flatMap(i => (i === id ? (nodeToDelete.inputs ?? []) : i)) ?? []
				// We should make some kind of generic processNodes / updateNodes that take in a predicate/filter
				// for which nodes it should update
				await updateNode(nodeId as Uuid, node)
			}
		}
		delete currentCanvas.project.spec.nodes[id]
	} else {
		// Otherwise, find the right parent to remove the child from
		await processNode(id, async node => {
			// Should technically always be an agent, but we need to get typescript to recognise it
			if (!isAgent(node)) return
			// Now we need to find all the nodes that used to depend on this node, and change their
			// inputs to this node's parent
			// I think for now we can just assume that all the nodes that might've depended on this node
			// are siblings to this node. I don't think we allow inter-flow/inter-agent deps (yet)
			for (const [childId, child] of Object.entries(node.spec.spec.nodes)) {
				if (child.inputs?.includes(id)) {
					child.inputs = child.inputs?.flatMap(i => (i === id ? (node.inputs ?? []) : i)) ?? []
					await updateNode(childId as Uuid, child)
				}
			}
			delete node.spec.spec.nodes[id]
			return node
		})
	}

	// Remove from node props too
	currentCanvas.nodeProps.delete(id)

	currentCanvas.hasUnsavedChanges = true
}

export const getDownstreamNodes = (id: Uuid): Set<Node> => {
	let downstreamNodes = new Set<Node>()
	if (!nodes) return downstreamNodes

	for (const node of get(nodes)) {
		if (node.data.inputs?.includes(id)) {
			downstreamNodes.add(node)
			// Get all this nodes downstream nodes as well
			const nestedNodes = getDownstreamNodes(node.id)
			downstreamNodes = downstreamNodes.union(nestedNodes)
		}
	}

	return downstreamNodes
}
