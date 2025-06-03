import type {
	Node as TriNode, // as to not conflict with Node (used for @xyflow/svelte)
	Flow,
	Action,
	Uuid,
	Component,
	Source
} from '$lib/types/agent'
import type { Project } from '$lib/types/project'
import type { Node, Edge } from '$lib/types/flow'
import { defaultProps, defaultEdgeProps } from '$lib/types/flow'
import { updateComponent, updateComponentPositions } from '$lib/actions/components'
import { invalidateAll } from '$app/navigation'
import { saveProject } from '$lib/actions/project'
import { page } from '$app/state'
import { getLayoutedNodes } from '$lib/components/canvas/layout.svelte'
import { clone } from '$lib/utils/clone'
import { selected } from '$lib/stores/panel.svelte'
import { getLeafNodes } from '$lib/utils/getLeafNodes'
import { getNodeSelector } from '$lib/utils/getNodeSelector'

let nodesStore = $state<Node[]>([])
let edgesStore = $state<Edge[]>([])

// SvelteFlow requires nodes & edges to be bound
// We can't export a let, so export getters and setters instead
export const getNodes = () => nodesStore
export const getEdges = () => edgesStore
export const setNodes = (newNodes: Node[]) => (nodesStore = newNodes)
export const setEdges = (newEdges: Edge[]) => (edgesStore = newEdges)

export const drafts = $state<Record<Uuid, Component>>({})
export const loadDrafts = (allDrafts: { component_id: Uuid; spec: Component }[]) => {
	// Path meta.intention which does not always exist
	// TODO: Clean this up
	for (const draft of allDrafts) {
		const meta = draft.spec.meta
		if (!('intention' in meta)) {
			meta.intention = {
				purpose: '',
				input: '',
				output: ''
			}
		}
		draft.spec.meta = meta
		drafts[draft.component_id as Uuid] = draft.spec
	}
}

// True if we're in the root level (Have not entered a flow)
const isRootLevel = $derived(page.params.id.split('/').length === 1)

// The current flow ID - last uuid in the path (if any)
const currentFlowId = $derived.by(() => {
	const ids = page?.params?.id?.split('/') ?? []
	if (ids.length <= 1) return undefined
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

export const getProject = () => page.data.project

export const getCurrentFlow = () => currentFlow
export const getCurrentFlowId = () => currentFlowId

export const isEndpoint = (component: Component): component is Action =>
	component.resource === 'endpoint/v1'
export const isAction = (component: Component): component is Action =>
	component.resource === 'action/v1'
export const isFlow = (component: Component): component is Flow => component.resource === 'flow/v1'

// Initialize the nodes on project or flow level
export async function initFlow(
	project: Project,
	allPositions: Record<Uuid, Record<Uuid, { x: number; y: number }>> = {}
) {
	console.log('loading flow', project)
	console.time('initFlow')

	// Get nodes from project or current flow
	const triNodes = currentFlow ? currentFlow.spec.spec.nodes : project.spec.nodes

	// Turn trinodes into Svelteflow nodes and edges
	// @ts-expect-error - we know the id is defined
	const positions = allPositions[isRootLevel ? project.meta.id : currentFlow?.spec.meta.id] ?? {}
	// eslint-disable-next-line prefer-const
	let { nodes, edges } = parseNodes(triNodes, positions)

	// Add data from local storage (open panels & payload)
	nodes = addPersistedDataToNodes(nodes)

	// Set selected node from url hash
	nodes = setSelected(nodes)

	if (currentFlow && !isRootLevel) {
		const hasNodes = !!nodes.length
		// find where to place the input node
		const minY = Math.min(...nodes.map(node => node.position.y)) ?? 0
		const minX = Math.min(...nodes.map(node => node.position.x)) ?? 0
		const maxX = Math.max(...nodes.map(node => node.position.x)) ?? 0
		// Add the parent/input node (for visualisation)
		nodes.push(getInputNode((minX + maxX) / 2, minY - 150) as Node)
		// Add the node selector if the flow has no nodes
		if (!hasNodes) {
			const { node, edge } = getNodeSelector(nodes[0].id, { x: 0, y: 0 }, true)
			node.origin = [0.3, 0] // small "hack" to get it to align in the middle
			console.log('adding node selector', node, edge)
			nodes.push(node)
			edges.push(edge)
		}
	}

	// if we're at the top level, add a ghost node for creating new flows
	if (isRootLevel) {
		nodes.push({
			id: 'create-node',
			type: 'create-node',
			draggable: false,
			selectable: false,
			position: { x: 0, y: 0 }
		})
	}

	// use nodes w/ positions if we can, otherwise auto-layout
	const validPositions = new Set(Object.keys(positions)).intersection(
		new Set(nodes.map(node => node.id))
	)
	nodesStore =
		validPositions.size >= nodes.length - 1 && // -1 for the input node
		!isRootLevel // always use auto layout at root level
			? nodes
			: await getLayoutedNodes(nodes, edges)
	edgesStore = edges
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
export function parseNodes(
	nodes: Record<Uuid, TriNode>,
	positions: Record<Uuid, { x: number; y: number }>
) {
	function getNode(node: TriNode, id: Uuid): Node {
		let type: Node['type']
		if (isAction(node.spec)) {
			type = 'action-node'
		} else if (isFlow(node.spec)) {
			type = 'flow-node'
		} else if (isEndpoint(node.spec)) {
			type = 'endpoint-node'
		} else {
			type = 'parent-node'
		}

		return {
			id,
			type,
			draggable: !isRootLevel, // disable dragging of top-level flows
			position: positions[id] ?? { x: 0, y: 0 },
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
				newEdges.push({
					type: 'default',
					id: `${id}:input`,
					source: 'input',
					target: id,
					data: {
						props: { ...defaultEdgeProps }
					}
				})
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
	const rawPayloads = getPersistedPayloads()

	return nodes.map(node => {
		node.data.props.payload = rawPayloads[node.id] || '{"msg":"Hello world"}'
		return node
	})
}

// Get the open panel items from localStorage, if any
function getPersistedPayloads(): Record<Uuid, string> {
	return JSON.parse(localStorage.getItem('payloads') || '{}')
}

function getInputNode(x: number, y: number) {
	if (!currentFlow) return

	return {
		id: 'input',
		draggable: false,
		type: 'parent-node',
		position: { x, y }
	}
}

const onFlowUpdate = (flow: Flow) => {
	const leafNodes = getLeafNodes(flow)
	flow.spec.outputs = Object.keys(leafNodes) as Uuid[]
}

export async function addNode(
	component: Component,
	position: { x: number; y: number },
	inputs: Source[]
) {
	const project = page.data.project

	if (!project) {
		throw new Error('No project found')
	}

	const newNodeId = crypto.randomUUID()
	const newNode = {
		component_id: component.meta.id,
		spec: component,
		inputs,
		component_version: null //component.meta.version
	}

	// Top-level flows - Update project with new node
	if (isRootLevel) {
		const updatedProject = clone(project)
		updatedProject.spec.nodes[newNodeId] = newNode
		await Promise.all([
			saveProject(updatedProject),
			updateComponentPositions(project.meta.id, {
				[newNodeId]: position
			})
		])
	}
	// Nested flows - Update component with new node
	else if (currentFlow) {
		const updatedFlow = clone(currentFlow) as typeof currentFlow
		updatedFlow.spec.spec.nodes[newNodeId] = newNode

		console.log(updatedFlow.spec)
		onFlowUpdate(updatedFlow.spec)

		await Promise.all([
			await updateComponent(updatedFlow.spec),
			updateComponentPositions(currentFlow.component_id, {
				[newNodeId]: position
			})
		])
	}

	await invalidateAll()

	// select the new node
	const node = nodesStore.find(node => node.id === newNodeId)
	if (node) node.selected = true
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
		onFlowUpdate(currentFlow.spec)
		await updateComponent(currentFlow.spec)
	}

	await invalidateAll()
}

export const addEdge = async (target: Node, source: Uuid | 'input') => {
	if (!currentFlow) throw new Error('No flow found')
	const node = target.data.trinode
	if (!node.inputs) node.inputs = []
	node.inputs.push(source === 'input' ? 'parent' : source)
	currentFlow.spec.spec.nodes[target.id] = node
	if (isRootLevel) await saveProject(page.data.project!)
	else await updateComponent(currentFlow.spec)
	await invalidateAll()
}

export const deleteEdge = async (edgeId: Edge['id']) => {
	if (!currentFlow) throw new Error('No flow found')
	const edge = edgesStore.find(e => e.id === edgeId)
	if (!edge) throw new Error(`Tried to remove non-existent edge ${edgeId}`)
	console.debug('removing edge', edgeId, edge)

	// Remove the input from the node (edges are defined on the target side)
	const target = currentFlow.spec.spec.nodes[edge.target]
	if (!target) throw new Error(`Tried to remove edge from non-existent node ${edge.target}`)
	const source = edge.source === 'input' ? 'parent' : edge.source
	// prettier-ignore
	currentFlow.spec.spec.nodes[edge.target].inputs = target.inputs?.filter(i => i !== source)

	// Update parent component
	if (isRootLevel) {
		await saveProject(page.data.project!)
	} else if (currentFlow) {
		await updateComponent(currentFlow.spec)
	} else {
		throw new Error('No project or flow found')
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
	let path = getBreadcrumbs()
		?.map(node => node.id)
		.join('/')

	if (selected.node) {
		path += `/${selected.node.id}`
	}

	return path
}
