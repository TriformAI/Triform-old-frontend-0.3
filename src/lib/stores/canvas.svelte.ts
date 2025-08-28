import type { TriNode } from '$lib/types/flow'
import type { UUID as Uuid } from 'crypto'
import type { Node, CanvasNode, Edge } from '$lib/types/canvas'
import { defaultProps, defaultEdgeProps } from '$lib/types/canvas'
import { updateComponent } from '$lib/actions/components'
import { saveProject } from '$lib/actions/project'
import { page } from '$app/state'
import { selected } from '$lib/stores/panel.svelte'
import { getNodeSelector } from '$lib/utils/getNodeSelector'
import { type NodeType } from '$lib/constants/nodeTypes'
import {
	isAction,
	isFlow,
	isAgent,
	projectModel,
	flowModel,
	agentModel,
	resolvedProjectModel,
	componentModel,
	isProject,
	resolvedComponentModel,
	nodePortModel,
	jsonSchemaTypeModel
} from '$lib/schemas'
import { type NodeContainer } from '$lib/types/flow'
import { toast } from 'svelte-sonner'
import type * as z from 'zod'
import { clone } from '$lib/utils/clone'
import { exclude } from '$lib/utils/exclude'
import { resolveComponentCached } from '$lib/utils/resolveComponent'

let nodesStore = $state<CanvasNode[]>([])
let edgesStore = $state<Edge[]>([])

// SvelteFlow requires nodes & edges to be bound
// We can't export a let, so export getters and setters instead
export const getNodes = () => nodesStore
export const getEdges = () => edgesStore
export const setNodes = (newNodes: CanvasNode[]) => (nodesStore = newNodes)
export const setEdges = (newEdges: Edge[]) => (edgesStore = newEdges)

// TODO: create a proxy or something so all instances of the same component share the same reference to the same component object
// so all changes to one node sync immediately to all other instances of the same component
let project = $state(page.data.project as z.infer<typeof resolvedProjectModel>)
export const getProject = () => project
export const setProject = (newProject: z.infer<typeof resolvedProjectModel>) =>
	(project = newProject)

const currentNodePath = $derived.by(() => {
	const path = page.url.pathname.split('/')
	// remove /project/projectId
	return path.slice(path.indexOf('project') + 2)
})
export const getCurrentNodePath = () => currentNodePath
export const getCurrentContainer = (): NodeContainer => {
	const path = page.url.pathname.split('/')
	// remove /project/projectId
	const projectIdx = path.indexOf('project')
	// if we're exiting the canvas, just return the project to avoid breaking
	if (projectIdx === -1) return project
	const nodePath = path.slice(projectIdx + 2)
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
const maxWidth = 600

// Initialize the nodes on project or flow level
export async function refreshFlow() {
	const container = getCurrentContainer()
	// parse in all the nodes into the nodesStore
	const { nodes, edges } = parseNodes(container)

	// add meta nodes
	if (isFlow(container) || isAgent(container)) {
		nodes.push({
			id: `${container.id as Uuid}:input`,
			type: 'input-node',
			draggable: isFlow(container),
			position: isFlow(container)
				? container.spec.io_nodes.input
				: {
						x: 0,
						y: 0
					},
			data: {
				props: { ...defaultProps }
			}
		})
		if ('io_nodes' in container.spec && 'output' in container.spec.io_nodes)
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
		const validNodes = nodes.filter(n => n.type !== 'input-node' && n.type !== 'output-node')
		const lastNode =
			validNodes.length > 0
				? validNodes.reduce((highest, current) => {
						if (current.position.y > highest.position.y) {
							return current
						}
						if (
							current.position.y === highest.position.y &&
							current.position.x > highest.position.x
						) {
							return current
						}
						return highest
					})
				: undefined

		let x = lastNode ? (lastNode.position.x ?? 0) + nodeSize.x + gap : 0
		let y = (lastNode?.position.y ?? 0) + 8 // 8=temp offset till we fix the node layout

		const activeNodeTypes = ['flow', 'agent', isAgent(container) && 'action'].filter(Boolean)

		if (isAgent(container) && y === 8) y += nodeSize.y + gap

		if (x > maxWidth) {
			x = 0
			y += nodeSize.y + gap
		}

		nodes.push({
			id: `${container.id as Uuid}:create`,
			type: 'create-node',
			draggable: false,
			position: { x, y },
			data: {
				activeNodeTypes,
				props: {
					...defaultProps
				}
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
			if (isAgent(root)) {
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
			selected: getNodes().find(n => n.id === id)?.selected ?? false,
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

const rollbackContainer = (snapshot: NodeContainer) => {
	if (isProject(snapshot)) {
		if (!project) {
			toast.error('No project found')
			throw new Error('No project found')
		}
		project.spec = snapshot.spec
		return
	}
	const parent = getNodeByPath(currentNodePath)?.spec as NodeContainer | undefined
	if (!parent) {
		toast.error('No parent container found')
		throw new Error(`No parent container found for ${currentNodePath.join('/')}`)
	}
	parent.spec = snapshot.spec
}

// TODO: update the local component with the new one we get back from the api
export const saveContainer = async (snapshot: NodeContainer) => {
	const container = getCurrentContainer()
	const res = isProject(container) ? await saveProject(container) : await updateComponent(container)
	if (!res.success) {
		toast.error('There was an error saving the container')
		console.log('failed', res.data)
		rollbackContainer(snapshot)
	}
	return res
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
	const snapshot = clone($state.snapshot(container))

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
				Math.max(
					...Object.values(container.spec.nodes).map(n => n.order ?? 0),
					Object.keys(container.spec.nodes).length
				) + 1
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

	await saveContainer(snapshot)
	await refreshFlow()

	// select the new node
	const node = nodesStore.find(node => node.id === newNodeId)
	if (node) node.selected = true

	return {
		id: newNodeId
	}
}

// Deletes a given node from the project or flow component
export async function deleteNode(id: Uuid) {
	if (!project) {
		throw new Error('No project loaded')
	}

	const container = getCurrentContainer()
	const snapshot = clone($state.snapshot(container))

	delete container.spec.nodes[id]

	await saveContainer(snapshot)
	await refreshFlow()
}

type EdgeConnection = {
	id: string
	handle: string
}
export const addEdge = async (source: EdgeConnection, target: EdgeConnection) => {
	const container = getCurrentContainer()
	const snapshot = clone($state.snapshot(container))

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

	await saveContainer(snapshot)
	await refreshFlow()
}

export const deleteEdge = async (edgeId: Edge['id'], save: boolean = true) => {
	const edge = edgesStore.find(e => e.id === edgeId)
	if (!edge || !edge.targetHandle) throw new Error(`Tried to remove non-existent edge ${edgeId}`)
	const container = getCurrentContainer()

	const snapshot = clone($state.snapshot(container))

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
	if (save) {
		await saveContainer(snapshot)
		await refreshFlow()
	}
}

export const addPort = async (
	nodeId: string,
	portName: string,
	type: z.infer<typeof jsonSchemaTypeModel>,
	variation: 'input' | 'output'
) => {
	const component = getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	if (!component) throw new Error(`Component ${nodeId} not found`)

	// Take snapshot for rollback
	const snapshot = clone(component.spec[`${variation}s`] || {})

	// Add the new port
	component.spec[`${variation}s`][portName] = {
		type,
		description: ''
	}

	// TODO: this is fucked up, this creates an "invisible" edge...
	if (variation === 'output') {
		const port = component.spec[`${variation}s`][portName] as any
		port.source = ''
		port.target = ''
	}

	// Save the component with rollback on failure
	const res = await updateComponent(component)
	if (!res.success) {
		component.spec[`${variation}s`] = snapshot
		throw new Error('Failed to add port')
	}
}

export const getBreadcrumbs = (): { id: string; name: string; type: NodeType; path: string }[] => {
	const parts = page.url.pathname.split('/').filter(Boolean)
	const projectIndex = parts.findIndex(p => p === 'project')
	const path = parts.slice(projectIndex + 2) // +2 because we want to skip both the project and its id

	return path.map((p: string, i: number) => {
		const spec = getNodeByPath(path.slice(0, i + 1))?.spec
		return {
			id: p,
			name: spec!.meta.name ?? 'Unknown',
			type: spec!.resource.split('/')[0] as NodeType,
			// +3 because we want to skip both the project and id, and get the first one after that
			path: `/${parts.slice(0, i + projectIndex + 3).join('/')}`
		}
	})
}

export const breadcrumbs = ():
	| { id: string; name: string; type?: NodeType | 'project'; path: string }[]
	| undefined => {
	if (!project) {
		return undefined
	}

	const projectUrl = `/project/${page.data.project?.id}`

	const breadcrumbs = [
		{ name: 'Projects', path: '/project', id: '' },
		{ name: project.meta.name, id: project.id || '', path: projectUrl, type: 'project' as const }
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

export const getVisibleComponent = (nodeId: string | 'container') => {
	const container = getCurrentContainer()
	if (nodeId === 'container') return container
	return container.spec.nodes[nodeId]?.spec as z.infer<typeof resolvedComponentModel>
}

const mergeExcluding = <T extends Record<string, unknown>>(
	target: T,
	source: T,
	excludeKeys: (keyof T)[] = []
): T => {
	if (!excludeKeys.length) return source

	const result = { ...source }
	excludeKeys.forEach(key => {
		if (key in target) {
			result[key] = target[key]
		}
	})
	return result
}

// replaces all instances of a given component with an updated one in the current project (locally)
// important to note that it isn't fully recursive, but rather just updates the unresolved component spec
export const updateLocalComponent = async <T extends z.infer<typeof componentModel>>(
	component: T,
	excludeKeys: { spec?: (keyof T['spec'])[]; meta?: (keyof T['meta'])[] } = {}
) => {
	console.log('updating local component', component.id, excludeKeys, component.spec)
	const processNode = async (node: TriNode) => {
		if (node.component_id === component.id) {
			console.log('updating node', node.component_id, component.id)
			// if it has nodes, we need to update them all
			if ('nodes' in component.spec && 'nodes' in node.spec.spec) {
				const existentComponents = Object.fromEntries(
					Object.values(node.spec.spec.nodes)
						.map(n => [n.component_id, n.spec])
						.filter(([_id, spec]) => spec)
				)
				// resolve, in case a new node was added, but also to ensure that node settings such as
				// inputs etc are updated properly (hence the existentComponents)
				const resolved = await resolveComponentCached(component, existentComponents)
				component.spec = resolved.spec
				console.log('new spec', component.spec)
			}
			node.spec.spec = mergeExcluding(
				node.spec.spec,
				component.spec,
				excludeKeys.spec as (keyof T['spec'])[]
			)
			node.spec.meta = mergeExcluding(
				node.spec.meta,
				component.meta,
				excludeKeys.meta as (keyof T['meta'])[]
			)
		}
		// recursively process all nodes in the component
		if ('nodes' in node.spec.spec)
			await Promise.all(Object.values(node.spec.spec.nodes).map(processNode))
	}
	await Promise.all(Object.values(project.spec.nodes).map(processNode))
}
