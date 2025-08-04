import type {
	Node as TriNode, // as to not conflict with Node (used for @xyflow/svelte)
	Source
} from '$lib/types'
import type { UUID as Uuid } from 'crypto'
import type { Project, Flow, Action, Component, ResolvedComponent } from '$lib/types/resources'
import type { Node, MetaNode, CanvasNode, Edge } from '$lib/types/canvas'
import { defaultProps, defaultEdgeProps } from '$lib/types/canvas'
import { updateComponent, updateComponentPositions } from '$lib/actions/components'
import { invalidateAll } from '$app/navigation'
import { saveProject } from '$lib/actions/project'
import { page } from '$app/state'
import { clone } from '$lib/utils/clone'
import { selected } from '$lib/stores/panel.svelte'
import { getLeafNodes } from '$lib/utils/getLeafNodes'
import { getNodeSelector } from '$lib/utils/getNodeSelector'
import {
	isAction,
	isFlow,
	isAgent,
	projectModel,
	flowModel,
	agentModel,
	resolvedFlowModel,
	resolvedAgentModel,
	resolvedProjectModel,
	isProject,
	resolvedComponentModel
} from '$lib/schemas'
import { type FlowContainer } from '$lib/types/flow'
import type * as z from 'zod'
import { toast } from 'svelte-sonner'

let nodesStore = $state<CanvasNode[]>([])
let edgesStore = $state<Edge[]>([])

// SvelteFlow requires nodes & edges to be bound
// We can't export a let, so export getters and setters instead
export const getNodes = () => nodesStore
export const getEdges = () => edgesStore
export const setNodes = (newNodes: CanvasNode[]) => (nodesStore = newNodes)
export const setEdges = (newEdges: Edge[]) => (edgesStore = newEdges)

let currentContainer = $state<FlowContainer>()
export const getCurrentContainer = () => currentContainer

let project = $state<z.infer<typeof resolvedProjectModel>>()

export const setProject = (proj: z.infer<typeof resolvedProjectModel>) => {
	project = proj
}

const nodeSize = 100
const gap = 30
const maxWidth = 1000

// Initialize the nodes on project or flow level
export async function initFlow(root: FlowContainer) {
	if (!project) setProject(page.data.project)
	if (!root) {
		toast.error('No container found!')
		return
	}
	console.log('initFlow', root)
	currentContainer = root

	// parse in all the nodes into the nodesStore
	const { nodes, edges } = parseNodes(root)

	// add meta nodes
	if (isFlow(root)) {
		nodes.push({
			id: `${root.id as Uuid}:input`,
			type: 'input-node',
			draggable: true,
			position: root.spec.io_nodes.input,
			data: {
				props: { ...defaultProps }
			}
		})
		nodes.push({
			id: `${root.id as Uuid}:output`,
			type: 'output-node',
			draggable: true,
			position: root.spec.io_nodes.output,
			data: {
				props: { ...defaultProps }
			}
		})
	}
	if (isProject(root) || isAgent(root)) {
		// find where to place the create node for agents and flow
		// should be the last node, so added one step after the last node
		const lastNode = nodes[nodes.length - 1]
		let x = lastNode.position.x + nodeSize + gap
		let y = lastNode.position.y
		if (x > maxWidth) {
			x = 0
			y += nodeSize + gap
		}
		nodes.push({
			id: `${root.id as Uuid}:create`,
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
export function parseNodes(root: FlowContainer) {
	const parseNode = (node: FlowContainer['spec']['nodes'][string], id: Uuid, i: number): Node => {
		// if it's part of an ordered context (ie it's a top-level flow or inside of an agent) we
		// need to lay it out according to the order instead of any x/y position
		const ordered = 'order' in node
		let x,
			y = 0
		if (ordered) {
			x = i * (nodeSize + gap)
			if (x > maxWidth) {
				x = 0
				y += nodeSize + gap
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

	const parseEdges = (node: FlowContainer['spec']['nodes'][string], id: Uuid) => {
		const newEdges: Edge[] = []
		if (!('inputs' in node)) return newEdges
		for (const [inputName, port] of Object.entries(node.inputs)) {
			if (port.source === 'parent') {
				newEdges.push({
					type: 'default',
					id: `${id}:input`,
					source: 'input',
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
					sourceHandle: inputName,
					target: id,
					targetHandle: port.target,
					data: { props: { ...defaultEdgeProps } }
				})
			}
		}
		return newEdges
	}

	// get the output edges for the container (if they exist)
	const outputEdges =
		'outputs' in (root?.spec ?? {})
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

export const getNodeByPath = (
	sourcePath: string[]
): z.infer<typeof resolvedComponentModel> | undefined => {
	if (!sourcePath.length) return
	const path = [...sourcePath]
	let node = project?.spec.nodes[path.shift() as string]
	if (!node) return
	while (path.length) {
		if (!node || !('nodes' in node.spec.spec)) return undefined
		const child: FlowContainer['spec']['nodes'][string] = node.spec.spec.nodes[path.shift() as Uuid]
		if (!child) return
		// @ts-expect-error type issue
		node = child
	}
	return node?.spec
}

/**
 * Updates all nodes that use the same component surgically without having to reparse the entire flow.
 * We'll have to modify this when we have proper version handling
 */
export const updateNodeComponent = (component: Component) => {
	// update the currently visible nodes
	for (const node of nodesStore) {
		if (node.data?.trinode?.component_id === component.id) {
			node.data.trinode.spec = component
		}
	}

	// run the same update on all nodes in the project to make sure it stays in sync too
	if (!project) {
		throw new Error('No project found')
	}

	const processNode = (node: TriNode) => {
		if (node.component_id === component.id) {
			node.spec = component
		}
		if (!node?.spec || !isFlow(node.spec)) return
		for (const child of Object.values(node.spec.spec.nodes)) {
			processNode(child)
		}
	}
	for (const node of Object.values(project.spec.nodes)) processNode(node)
}

export async function addNode(
	component: Component,
	position: { x: number; y: number },
	inputs: Source[]
) {
	if (!project) {
		throw new Error('No project loaded')
	}

	const newNodeId = crypto.randomUUID()

	// Top-level flows - Update project with new node
	if (isRootLevel) {
		const updatedProject = clone(project)

		updatedProject.spec.nodes = Object.fromEntries(
			Object.entries(updatedProject.spec.nodes).map(([id, node]) => {
				const { component_id } = node
				return [id, { component_id }]
			})
		)

		updatedProject.spec.nodes[newNodeId] = {
			component_id: component.id!
		}

		console.log('updatedProject.spec.nodes', updatedProject.spec.nodes)

		const spec = updatedProject.spec

		await Promise.all([
			saveProject(project.id!, { spec })
			// updateComponentPositions(project.id, {
			// 	[newNodeId]: position
			// })
		])
	}
	// Nested flows - Update component with new node
	else if (currentFlow) {
		const updatedFlow = clone(currentFlow) as typeof currentFlow
		updatedFlow.spec.spec.nodes[newNodeId] = newNode

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
	if (!project) {
		throw new Error('No project loaded')
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

export const getBreadcrumbs = () => {
	const parts = page.url.pathname.split('/').filter(Boolean)
	const projectIndex = parts.findIndex(p => p === 'project')
	const path = parts.slice(projectIndex + 2) // +2 because we want to skip both the project and its id

	return path.map((p: string, i: number) => ({
		id: p as Uuid,
		name: getNodeByPath(path.slice(0, i + 1))?.meta?.name ?? 'Unknown',
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
