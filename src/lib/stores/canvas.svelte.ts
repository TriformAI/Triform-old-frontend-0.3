import type { TriNode } from '$lib/types/flow'
import type { UUID as Uuid } from 'crypto'
import type { Node, CanvasNode, Edge } from '$lib/types/canvas'
import { defaultProps, defaultEdgeProps } from '$lib/types/canvas'
import { updateComponent } from '$lib/actions/components'
import { saveProject } from '$lib/actions/project'
import { page } from '$app/state'
import { selected } from '$lib/stores/panel.svelte'
import { getNodeSelector } from '$lib/utils/getNodeSelector'
import {
	isAction,
	isFlow,
	isAgent,
	projectModel,
	flowModel,
	agentModel,
	resolvedProjectModel,
	isProject,
	resolvedComponentModel,
	nodePortModel
} from '$lib/schemas'
import { type NodeContainer } from '$lib/types/flow'
import { toast } from 'svelte-sonner'
import type * as z from 'zod'

let nodesStore = $state<CanvasNode[]>([])
let edgesStore = $state<Edge[]>([])

// SvelteFlow requires nodes & edges to be bound
// We can't export a let, so export getters and setters instead
export const getNodes = () => nodesStore
export const getEdges = () => edgesStore
export const setNodes = (newNodes: CanvasNode[]) => (nodesStore = newNodes)
export const setEdges = (newEdges: Edge[]) => (edgesStore = newEdges)

let project = $derived(page.data.project)
export const getProject = () => project
export const setProject = (proj: z.infer<typeof resolvedProjectModel>) => {}

export const getCurrentContainer = (): NodeContainer => {
	const path = page.url.pathname.split('/')
	// remove /project/projectId
	const nodePath = path.slice(path.indexOf('project') + 2)
	if (!project) {
		toast.error('No project found')
		throw new Error('No project found')
	}
	if (!nodePath.length) return project
	const newContainer = getNodeByPath(nodePath)?.spec
	if (!newContainer) {
		toast.error('Invalid node path!')
		throw new Error('Invalid node path!')
	}
	return newContainer as NodeContainer
}

const nodeSize = {
	x: 60 * 4,
	y: 20 * 4
}
const gap = 50
const maxWidth = 1500

// Initialize the nodes on project or flow level
export async function refreshFlow() {
	const container = getCurrentContainer()
	// parse in all the nodes into the nodesStore
	const { nodes, edges } = parseNodes(container)

	console.log('nodes', nodes, 'edges', edges)

	// add meta nodes
	if (isFlow(container)) {
		nodes.push({
			id: `${container.id as Uuid}:input`,
			type: 'input-node',
			draggable: true,
			position: container.spec.io_nodes.input,
			data: {
				props: { ...defaultProps }
			}
		})
		nodes.push({
			id: `${container.id as Uuid}:output`,
			type: 'output-node',
			draggable: true,
			position: container.spec.io_nodes.output,
			data: {
				props: { ...defaultProps }
			}
		})
	}
	if (isProject(container) || isAgent(container)) {
		// find where to place the create node for agents and flow
		// should be the last node, so added one step after the last node
		const lastNode = nodes[nodes.length - 1]
		let x = lastNode.position.x + nodeSize.x + gap
		let y = lastNode.position.y
		if (x > maxWidth) {
			x = 0
			y += nodeSize.y + gap
		}
		nodes.push({
			id: `${container.id as Uuid}:create`,
			type: 'create-node',
			draggable: true,
			position: { x, y },
			data: {
				props: { ...defaultProps }
			}
		})
	}

	setNodes(nodes)
	setEdges(edges)
}

// Get nodes from project
// Enrich node with additional data
// Create edges
export function parseNodes(root: NodeContainer) {
	const parseNode = (node: TriNode, id: Uuid, i: number): Node => {
		// if it's part of an ordered context (ie it's a top-level flow or inside of an agent) we
		// need to lay it out according to the order instead of any x/y position
		const ordered = 'order' in node
		let x,
			y = 0
		if (ordered) {
			x = i * (nodeSize.x + gap)
			if (x > maxWidth) {
				x = 0
				y += nodeSize.y + gap
			}
		} else if ('position' in node) {
			x = node.position.x
			y = node.position.y
		} else {
			throw new Error('Unknown node position')
		}

		const getType = () => {
			if (isAction(node.spec)) return 'action-node'
			if (isFlow(node.spec)) return 'flow-node'
			if (isAgent(node.spec)) return 'agent-node'
			throw new Error('Unknown node type')
		}

		return {
			id,
			type: getType(),
			draggable: !ordered,
			position: { x, y },
			data: {
				trinode: node,
				props: { ...defaultProps }
			}
		}
	}

	const parseEdges = (node: TriNode, id: Uuid) => {
		const newEdges: Edge[] = []
		if (!('inputs' in node)) return newEdges
		for (const [inputName, port] of Object.entries(node.inputs ?? {})) {
			if (port.source === 'parent') {
				newEdges.push({
					type: 'default',
					id: `${id}:input`,
					source: `${root.id}:input`,
					sourceHandle: port.target,
					target: id,
					targetHandle: inputName,
					data: { props: { ...defaultEdgeProps } }
				})
			} else {
				newEdges.push({
					type: 'default',
					id: `${id}:${inputName}`,
					source: port.source,
					sourceHandle: port.target,
					target: id,
					targetHandle: inputName,
					data: { props: { ...defaultEdgeProps } }
				})
			}
		}
		return newEdges
	}

	// get the output edges for the container (if they exist)
	const outputEdges =
		'outputs' in root?.spec
			? (Object.entries(root.spec.outputs)
					.map(([outputName, port]) => {
						if (!('source' in port) || !('target' in port)) return
						return {
							type: 'default',
							id: `${root.id}:${port.source}:${outputName}`,
							source: port.source,
							sourceHandle: port.target,
							target: `${root.id}:output`,
							targetHandle: outputName,
							data: { props: { ...defaultEdgeProps } }
						}
					})
					.filter(o => o !== undefined) as Edge[])
			: []

	return Object.entries(root?.spec?.nodes ?? {})
		.sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
		.map(([id, node], i) => {
			return {
				node: parseNode(node, id as Uuid, i),
				edges: parseEdges(node, id as Uuid)
			}
		})
		.reduce(
			(acc, curr) => ({
				nodes: [...acc.nodes, curr.node],
				edges: [...acc.edges, ...curr.edges]
			}),
			{
				nodes: [] as CanvasNode[],
				edges: outputEdges
			}
		)
}

export const getNodeByPath = (sourcePath: string[]): TriNode | undefined => {
	if (!sourcePath.length) return
	const path = [...sourcePath]
	let node = project?.spec.nodes[path.shift() as string]
	if (!node) return
	while (path.length) {
		if (!node || !('nodes' in node.spec.spec)) return undefined
		const child: TriNode = node.spec.spec.nodes[path.shift() as Uuid]
		if (!child) return
		// @ts-expect-error type issue
		node = child
	}
	return node
}

// TODO: update the local component with the new one we get back from the api
const saveContainer = async (container: NodeContainer) => {
	if (isProject(container)) return await saveProject(container)
	return await updateComponent(container)
}

export async function addNode(
	component: z.infer<typeof resolvedComponentModel>,
	position: { x: number; y: number } = { x: 0, y: 0 },
	inputs: Record<string, z.infer<typeof nodePortModel>> = {}
) {
	if (!project) {
		throw new Error('No project loaded')
	}

	const newNodeId = crypto.randomUUID()
	const container = getCurrentContainer()

	const baseNode = {
		component_id: component.id!,
		spec: component,
		inputs: !isProject(container) ? inputs : undefined
	} as TriNode

	let newNode

	if (isProject(container) || isAgent(container)) {
		newNode = {
			...baseNode,
			order:
				(Math.max(...Object.values(container.spec.nodes).map(n => n.order)) ??
					Object.keys(container.spec.nodes).length) + 1
		} as
			| z.infer<typeof projectModel>['spec']['nodes'][string]
			| z.infer<typeof agentModel>['spec']['nodes'][string]
	} else {
		newNode = {
			...baseNode,
			position
		} as z.infer<typeof flowModel>['spec']['nodes'][string]
	}

	// @ts-expect-error fuck-ass error that I'm praying will fix itself once we remove the old types
	container.spec.nodes[newNodeId] = newNode

	console.log('newNode', newNode, inputs)

	await saveContainer(container)
	await refreshFlow()

	// select the new node
	const node = nodesStore.find(node => node.id === newNodeId)
	if (node) node.selected = true
}

// Deletes a given node from the project or flow component
export async function deleteNode(id: Uuid) {
	if (!project) {
		throw new Error('No project loaded')
	}

	const container = getCurrentContainer()
	delete container.spec.nodes[id]
	await saveContainer(container)
	await refreshFlow()
}

type EdgeConnection = {
	id: string
	handle: string
}
export const addEdge = async (source: EdgeConnection, target: EdgeConnection) => {
	const container = getCurrentContainer()
	// if we're adding a new output edge, add it to the container
	if (target.id === `${container.id}:output`) {
		if (!('outputs' in container.spec))
			throw new Error(`Container ${container.id} does not support outputs`)
		Object.assign(container.spec.outputs[target.handle], {
			source: source.id.split(':')[0],
			target: source.handle
		})
	} else {
		// otherwise, just create the new input
		const node = container.spec.nodes[target.id]
		if (!node) throw new Error(`Tried to add edge to non-existent node ${target.id}`)
		if (!('inputs' in node)) throw new Error(`Node ${target.id} does not support inputs`)
		const sourceId = source.id.endsWith(':input') ? 'parent' : source.id
		node.inputs[target.handle] = {
			source: sourceId,
			target: source.handle
		}
	}
	await saveContainer(container)
	await refreshFlow()
}

export const deleteEdge = async (edgeId: Edge['id']) => {
	const edge = edgesStore.find(e => e.id === edgeId)
	if (!edge || !edge.targetHandle) throw new Error(`Tried to remove non-existent edge ${edgeId}`)
	const container = getCurrentContainer()

	// if it's an output edge
	if (edge.target === `${container.id}:output`) {
		if (!('outputs' in container.spec))
			throw new Error(`Container ${container.id} does not support outputs`)
		Object.assign(container.spec.outputs[edge.targetHandle], {
			source: null,
			target: null
		})
	} else {
		// Remove the input from the node (edges are defined on the target side)
		const target = container.spec.nodes[edge.target]
		if (!target) throw new Error(`Tried to remove edge from non-existent node ${edge.target}`)
		if (!('inputs' in target)) throw new Error(`Node ${edge.target} does not support inputs`)
		delete target.inputs[edge.targetHandle]
	}

	// TODO: revert if this fails
	await saveContainer(container)

	await refreshFlow()
}

export const getBreadcrumbs = () => {
	const parts = page.url.pathname.split('/').filter(Boolean)
	const projectIndex = parts.findIndex(p => p === 'project')
	const path = parts.slice(projectIndex + 2) // +2 because we want to skip both the project and its id

	return path.map((p: string, i: number) => ({
		id: p as Uuid,
		name: getNodeByPath(path.slice(0, i + 1))?.spec.meta?.name ?? 'Unknown',
		// +3 because we want to skip both the project and id, and get the first one after that
		path: `/${parts.slice(0, i + projectIndex + 3).join('/')}`
	}))
}

export const breadcrumbs = () => {
	if (!project) {
		return undefined
	}

	const projectUrl = `/project/${page.data.project?.id}`

	const breadcrumbs = [
		{ name: 'Projects', id: '', path: '/project' },
		{ name: project.meta.name, id: project.id, path: projectUrl }
	]

	const flowCrumbs = getBreadcrumbs()

	if (flowCrumbs) {
		breadcrumbs.push(...flowCrumbs)
	}

	return breadcrumbs
}

// TODO: get this from the path instead
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
