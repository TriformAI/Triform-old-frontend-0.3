import type {
	Node as TriNode, // as to not conflict with Node (used for @xyflow/svelte)
	Flow,
	Action,
	Uuid
} from '$lib/types/agent'
import { getActionModel, getFlowModel } from '$lib/nodeModels'
import type { Project } from '$lib/types/project'
import type { Node, Edge } from '$lib/types/flow'
import { defaultProps, defaultEdgeProps } from '$lib/types/flow'
import { createComponent, updateComponent } from '$lib/actions/components'
import { invalidateAll } from '$app/navigation'
import { saveProject } from '$lib/actions/project'
import { page } from '$app/state'
import { getLayoutedNodes } from '$lib/components/canvas/layout.svelte'
import { clone } from '$lib/utils/clone'
import { selected } from '$lib/stores/panel.svelte'

let nodesStore = $state<Node[]>([])
let edgesStore = $state<Edge[]>([])

// SvelteFlow requires nodes & edges to be bound
// We can't export a let, so export getters and setters instead
export const getNodes = () => nodesStore
export const getEdges = () => edgesStore
export const setNodes = (newNodes: Node[]) => (nodesStore = newNodes)
export const setEdges = (newEdges: Edge[]) => (edgesStore = newEdges)

// True if we're in the root level (Have not entered a flow)
const isRootLevel = $derived(page.params.id.split('/').length === 1)

// The current flow ID - last uuid in the path (if any)
const currentFlowId = $derived.by(() => {
	const ids = page.params.id.split('/')
	if (ids.length === 1) return undefined
	return ids.pop()
}) as Uuid | undefined

const currentFlow = $derived.by(() => {
	if (!currentFlowId) {
		return
	}

	const project = page.data.project
	if (!project) {
		return
	}

	return getFlowById(project.spec.nodes, currentFlowId as Uuid)
})

export const getCurrentFlow = () => currentFlow

export const isEndpoint = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'endpoint/v1'
export const isAction = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'action/v1'
export const isFlow = (node: TriNode): node is TriNode & { spec: Flow } =>
	node.spec.resource === 'flow/v1'

// Initialize the nodes on project or flow level
export async function initFlow(project: Project) {
	console.log('loading flow', project)

	// Get nodes from project or current flow
	const triNodes = currentFlow ? currentFlow.spec.spec.nodes : project.spec.nodes

	// Turn trinodes into Svelteflow nodes and edges
	let { nodes, edges } = parseNodes(triNodes)

	// Add data from local storage (open panels & payload)
	nodes = addPersistedDataToNodes(nodes)

	// Set selected node from local storage
	nodes = setSelected(nodes)

	// Add the parent node (for visualisation)
	const flow = addParentFlowNode(nodes, edges, currentFlow?.component_id)

	nodesStore = await getLayoutedNodes(flow.nodes, flow.edges)
	edgesStore = flow.edges
}

// Get selected node from url hash, if any, and set as selected
function setSelected(nodes: Node[]) {
	const selectedNodeId = window.location.hash.replace('#', '')
	if (!selectedNodeId) return nodes

	return nodes.map(node => {
		if (node.id === selectedNodeId) {
			node.selected = true
		}
		return node
	})
}

// Get nodes from project
// Enrich node with additional data
// Create edges
export function parseNodes(nodes: Record<Uuid, TriNode>) {
	function getNode(node: TriNode, id: Uuid): Node {
		let type: Node['type']
		if (isAction(node)) {
			type = 'action-node'
		} else if (isFlow(node)) {
			type = 'flow-node'
		} else if (isEndpoint(node)) {
			type = 'endpoint-node'
		} else {
			type = 'parent-node'
		}

		return {
			id,
			type,
			draggable: false,
			position: { x: 0, y: 0 },
			data: {
				trinode: node,
				props: { ...defaultProps }
			}
		}
	}

	function getEdges(node: TriNode, id: Uuid) {
		const newEdges: Edge[] = []
		for (const input of node.inputs ?? []) {
			// Flow inputs
			if (input === 'parent') {
				continue
			}

			// Normal edges
			newEdges.push({
				type: 'default',
				id: `${id}:${input}`,
				source: input,
				target: id,
				data: {
					props: { ...defaultEdgeProps }
				}
			})
		}
		return newEdges
	}

	return Object.entries(nodes)
		.map(([id, node]) => {
			return {
				node: getNode(node, id as Uuid),
				edges: getEdges(node, id as Uuid)
			}
		})
		.reduce(
			(acc, curr) => ({
				nodes: [...acc.nodes, curr.node],
				edges: [...acc.edges, ...curr.edges]
			}),
			{
				nodes: [] as Node[],
				edges: [] as Edge[]
			}
		)
}

function addPersistedDataToNodes(nodes: Node[]) {
	const rawOpenPanelItems = getPersistedPanelItems()
	const rawPayloads = getPersistedPayloads()

	return nodes.map(node => {
		node.data.props.openPanelItems = rawOpenPanelItems[node.id] || []
		node.data.props.payload = rawPayloads[node.id] || '{"msg":"Hello world"}'
		return node
	})
}

// Get the open panel items from localStorage, if any
function getPersistedPanelItems(): Record<Uuid, string[]> {
	return JSON.parse(localStorage.getItem('openPanelItems') || '{}')
}

// Get the open panel items from localStorage, if any
function getPersistedPayloads(): Record<Uuid, string> {
	return JSON.parse(localStorage.getItem('payloads') || '{}')
}

function addParentFlowNode(nodes: Node[], edges: Edge[], id?: Uuid) {
	//const isRootAndEmpty = !currentFlow && !nodes.length
	if (!currentFlow) {
		return { nodes, edges }
	}

	const newId = id ?? crypto.randomUUID()
	for (const item of nodes) {
		if (item.data.trinode.inputs?.[0] === 'parent') {
			edges.push({
				id: `${newId}:${item.id}`,
				source: newId,
				type: 'default',
				target: item.id,
				data: {
					props: {
						deleted: false
					}
				}
			})
		}
	}

	nodes.push({
		id: newId,
		draggable: false,
		type: 'parent-node',
		position: { x: 0, y: 0 }
	})

	return { nodes, edges }
}

export async function addNode(type: 'action' | 'flow', sourceId?: Uuid | 'parent') {
	const project = page.data.project

	if (!project) {
		throw new Error('No project found')
	}

	// Get the node model
	const newNode = type === 'action' ? getActionModel() : getFlowModel()
	newNode.inputs = [sourceId ?? 'parent']

	// Create the component and set props to newNode
	const newComponent = await createComponent(newNode.spec)
	newNode.component_id = newComponent.meta.id
	newNode.spec = newComponent

	const newNodeId = crypto.randomUUID()

	// Top-level flows - Update project with new node
	if (isRootLevel) {
		const updatedProject = clone(project)
		updatedProject.spec.nodes[newNodeId] = newNode
		await saveProject(updatedProject)
	}

	// Nested flows - Update component with new node
	else if (currentFlow) {
		const updatedFlow = clone(currentFlow) as typeof currentFlow
		updatedFlow.spec.spec.nodes[newNodeId] = newNode
		await updateComponent(updatedFlow.spec)
	}

	await invalidateAll()
}

// Deletes a given node from the project or flow component
export async function deleteNode(id: Uuid) {
	const project = page.data.project

	if (!project) {
		throw new Error('No project found')
	}

	// Delete node from project
	if (isRootLevel) {
		delete project.spec.nodes[id]
		await saveProject(project)
	}

	// Delete node from flow
	else if (currentFlow) {
		delete currentFlow.spec.spec.nodes[id]
		await updateComponent(currentFlow.spec)
	}

	await invalidateAll()
}

// Get a flow anywhere in tje project by id
function getFlowById(
	root: Record<Uuid, TriNode>,
	uuid: Uuid
): (TriNode & { spec: Flow }) | undefined {
	function findFlow(nodes: Record<Uuid, TriNode>): TriNode | undefined {
		for (const [id, node] of Object.entries(nodes)) {
			if (node.spec.resource !== 'flow/v1') continue

			if (id === uuid) {
				return node
			}

			// Capture and return if found
			const result = findFlow(node.spec.spec.nodes)
			if (result) return result
		}

		return undefined
	}

	return findFlow(root)
}

type Breadcrumb = { id: Uuid; name: string; path: string }[]

// Make breadcrumbs to show when you are in a nested flow
function makeBreadcrumbs(root: Record<Uuid, TriNode>, uuid: Uuid): Breadcrumb | undefined {
	function findPath(
		nodes: Record<Uuid, TriNode>,
		targetId: Uuid,
		path: Breadcrumb = [],
		currentPath: string = ''
	): Breadcrumb | undefined {
		for (const [id, node] of Object.entries(nodes)) {
			if (node.spec.resource !== 'flow/v1') continue

			// Build the current breadcrumb path
			const newPath = currentPath ? `${currentPath}/${id}` : id

			const currentBreadcrumb = [
				...path,
				{ id: id as Uuid, name: node.spec.meta.name, path: newPath }
			]

			// Found the target node
			if (id === targetId) {
				return currentBreadcrumb
			}

			// Recur into child nodes if they exist
			const childNodes = node.spec.spec.nodes
			if (childNodes) {
				const result = findPath(childNodes, targetId, currentBreadcrumb, newPath)
				if (result) return result
			}
		}

		return undefined
	}

	return findPath(root, uuid)
}

export const getBreadcrumbs = () => {
	if (page.data.project && currentFlowId) {
		return makeBreadcrumbs(page.data.project.spec.nodes, currentFlowId)
	}

	return undefined
}

export const getNodePath = () => {
	const breadcrumbs = getBreadcrumbs()
	if (!breadcrumbs || !selected) {
		return undefined
	}

	return (
		getBreadcrumbs()
			?.map(node => node.id)
			.join('/') + `/${selected.node.id}`
	)
}

// Remove an edge
export const removeEdge = (edgeId: Edge['id']) => {
	const edge = edges.find(e => e.id === edgeId)
	if (!edge) throw new Error(`Tried to remove non-existent edge ${edgeId}`)
	console.debug('removing edge', edgeId, edge)

	let previous: ReturnType<typeof updateNode>
	// The resource that needs to be saved/published after performing the deletion
	let toSave: Node['id'] | 'project'

	// If id ends with :input, it's an edge to the parent input/ingress handle,
	// so we need to remove the 'parent' input from the target node
	if (edgeId.endsWith(':input')) {
		const nodeId = edge.target
		const node = nodes[nodeId]
		// TODO: maybe ignore this case and just delete the edge from the array?
		if (!node) throw new Error(`Tried to remove input from non-existent node ${nodeId}`)
		const trinode = structuredClone($state.snapshot(node.data.trinode))
		trinode.inputs = trinode.inputs?.filter(i => i !== 'parent')
		previous = updateNode(nodeId, trinode)
		toSave = edge.source // parent flow ID
		console.log('removing input', edgeId, trinode.inputs)
	}
	// If id ends with :output, it's an edge to the parent output/egress handle,
	// so we need to remove the node from the flows 'outputs' array
	else if (edgeId.endsWith(':output')) {
		const flowId = edge.target
		const flow = nodes[flowId]
		if (!flow) throw new Error(`Tried to remove output from non-existent flow ${flowId}`)
		// prettier-ignore
		if (!isFlow(flow.data.trinode)) throw new Error(`Tried to remove output from non-flow node ${flowId}`)
		const trinode = structuredClone($state.snapshot(flow.data.trinode))
		trinode.spec.spec.outputs = trinode.spec.spec.outputs?.filter(o => o !== edge.source)
		previous = updateNode(flowId, trinode)
		toSave = flowId
	}
	// Otherwise, it's just a normal edge between two nodes, so we need to remove
	// it from the target node's 'inputs' array
	else {
		const nodeId = edge.target
		const node = nodes[nodeId]
		if (!node) throw new Error(`Tried to remove edge from non-existent node ${nodeId}`)
		const trinode = structuredClone($state.snapshot(node.data.trinode))
		trinode.inputs = trinode.inputs?.filter(i => i !== edge.source)
		previous = updateNode(nodeId, trinode)
		toSave = node.parentId ?? 'project'
	}

	return {
		previous,
		toSave
	}
}
