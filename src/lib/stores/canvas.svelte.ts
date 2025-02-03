import type {
	Node as TriNode, // as to not conflict with @xyflow/svelte
	Agent,
	Action,
	Uuid
} from '$lib/types/agent'
import type { Node } from '$lib/types/flow'
import type { Edge } from '@xyflow/svelte'

export type ParsedGraph = {
	nodes: Node[]
	edges: Edge[]
}

// The currently shown resource should always be an agent
// The agent can have nested agents and actions, in sequence or parallel
export interface Canvas {
	resource: Agent
	// For when we want multiple tabs:
	// id: string,
	// label: string,
}

export interface OpenAgents {
	[key: string]: boolean
}

const isAction = (node: TriNode): node is TriNode & { spec: Action } =>
	node.spec.resource === 'action/v1'
const isAgent = (node: TriNode): node is TriNode & { spec: Agent } =>
	node.spec.resource === 'agent/v1'

export const parseAgent = (agent: Agent, parentId?: Uuid, nodeId?: Uuid): ParsedGraph => {
	const nodes: Node[] = []
	const edges: Edge[] = []
	// Unresolved:
	if (!('spec' in agent)) return { nodes, edges }

	// Push the parent agent node
	const agentId = nodeId ?? agent.meta.id
	const isOpen = openAgents[agentId]
	nodes.push({
		// NodeId is the id of the actual node, it's onl specified for agents that are
		// nested within another agent
		id: nodeId ?? agentId,
		type: isOpen ? 'open-agent-node' : 'agent-node',
		position: { x: 0, y: 0 },
		parentId,
		extent: parentId ? 'parent' : undefined,
		data: {
			spec: agent,
			component_name: agent.meta.name,
			// TODO: these should be component-specific (I think)
			component_id: agent.meta.id,
			component_version: agent.meta.version
		}
	})

	if (!isOpen) return { nodes, edges }

	for (const [id, node] of Object.entries(agent.spec.nodes)) {
		// Skip unresolved for now
		if (!('spec' in node)) continue

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
			console.log('action', id, node.spec.meta.name, node.spec.meta.version)
			nodes.push({
				id,
				type: 'action-node',
				parentId: agentId,
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
			const { nodes: childNodes, edges: childEdges } = parseAgent(node.spec, agentId, id as Uuid)
			nodes.push(...childNodes)
			edges.push(...childEdges)
		} else throw new Error(`Unknown node type ${node.resource}`)
	}

	console.log('nodes', nodes)

	return { nodes, edges }
}

export const canvasStore = $state<Canvas[]>([])

export const openAgents = $state<OpenAgents>({ test_agent: false })

// TODO: type this properly
export const loadAgent = (resource: Agent) => {
	// Since we only support one tab for now, replace the entire store
	canvasStore.length = 0

	canvasStore.push({ resource })

	console.log('Loaded resource', resource)
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

	// The top level node is always an agent
	for (const [nodeId, node] of Object.entries(canvasStore[0].resource.spec.nodes)) {
		await process(node, nodeId as Uuid)
	}
	return updatedNode
}

export const updateNode = async (id: Uuid, updatedNode: TriNode) => await processNode(id, async () => updatedNode)

// Adds a child node to a specific parent node
export const addChild = (parentId: Uuid, child: TriNode) => {

}
