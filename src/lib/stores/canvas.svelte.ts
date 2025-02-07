import type {
	Node as TriNode, // as to not conflict with @xyflow/svelte
	Agent,
	Action,
	Uuid
} from '$lib/types/agent'
import type { Project } from '$lib/types/project'
import type { Node, NodeProps } from '$lib/types/flow'
import type { Edge } from '@xyflow/svelte'

import { SvelteMap } from 'svelte/reactivity'

export type ParsedGraph = {
	nodes: Node[]
	edges: Edge[]
}

// The currently shown resource should always be an agent
// The agent can have nested agents and actions, in sequence or parallel
export interface Canvas {
	project: Project
	// Visual properties of the rendered nodes (frontend-only thing)
	nodeProps: SvelteMap<Uuid, NodeProps>
	// For when we want multiple tabs:
	// id: string,
	// label: string,
}

export const setNodeProps = (id: Uuid, props: Partial<NodeProps>) => {
	const propsRef = selectedCanvas().nodeProps.get(id)
	if (!propsRef) return
	const newProps = Object.assign({}, propsRef, props)
	selectedCanvas().nodeProps.set(id, newProps)
}

export const getNodeProps = (id: Uuid): NodeProps | undefined => selectedCanvas().nodeProps.get(id)

const initNodeProps = (id: Uuid) => {
	if (!getNodeProps(id)) {
		selectedCanvas().nodeProps.set(id, {
			expanded: false
		})
	}
}

const isAction = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'action/v1'
const isAgent = (node: TriNode): node is TriNode & { spec: Agent } =>
	node.spec.resource === 'agent/v1'

export const parseProject = (project: Project) => {
	const parseNode = (node: TriNode, id: Uuid, parentId?: Uuid): ParsedGraph => {
		const nodes: Node[] = []
		const edges: Edge[] = []

		for (const input of node.inputs ?? []) {
			if (input === 'parent') continue
			edges.push({
				id: `${id}:${input}`,
				source: input,
				target: id,
				type: 'floating'
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
				position: { x: 0, y: 0 },
				data: {
					spec: node.spec,
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
				position: { x: 0, y: 0 },
				parentId,
				extent: parentId ? 'parent' : undefined,
				data: {
					spec: node.spec,
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
		} else throw new Error(`Unknown node type ${node.resource}`)

		return {
			nodes,
			edges
		}
	}

	return Object.entries(project.spec.nodes)
		.map(([id, node]) => parseNode(node, id as Uuid))
		.reduce((acc, curr) => ({
			nodes: [...acc.nodes, ...curr.nodes],
			edges: [...acc.edges, ...curr.edges]
		}), { nodes: [], edges: [] })
}

export const canvasStore = $state<Canvas[]>([])
const currentCanvas = $derived(canvasStore[0])
export const selectedCanvas = () => currentCanvas

// TODO: type this properly
export const loadProject = (project: Project) => {
	// Since we only support one tab for now, replace the entire store
	canvasStore.length = 0

	canvasStore.push({
		project,
		nodeProps: new SvelteMap()
	})

	console.log('Loaded project', project)

	const { nodes } = parseProject(project)
	for (const node of nodes) initNodeProps(node.id)
}

// Generic function for applying a function to some node in the canvas
const processNode = async (id: Uuid, fn: (node: TriNode) => Promise<TriNode | undefined>) => {
	let updatedNode: TriNode | undefined = undefined
	const process = async (node: TriNode, nodeId: Uuid) => {
		if (nodeId === id) {
			Object.assign(node, await fn(node))
			updatedNode = node
			return
		}

		if (isAgent(node)) {
			if (!('spec' in node)) return
			for (const [childId, child] of Object.entries(node.spec.spec.nodes)) await process(child, childId as Uuid)
		}
		// Currently we only support updating children of agents so don't do anything else here
	}

	for (const [nodeId, node] of Object.entries(canvasStore[0].project.spec.nodes)) {
		await process(node, nodeId as Uuid)
	}

	return updatedNode
}

export const updateNode = async (id: Uuid, updatedNode: TriNode) => await processNode(id, async () => updatedNode)

// Adds a child node to a specific parent node
export const addChild = (parentId: Uuid, child: TriNode) => {

}
