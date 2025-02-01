import type {
	Node as TriNode, // as to not conflict with @xyflow/svelte
	Agent,
	Action,
	Uuid
} from '$lib/types/agent'
import type { Edge, Node } from '@xyflow/svelte'
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
			name: agent.meta.name,
			version: agent.meta.version,
			id: agentId,
			spec: agent.spec,
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
					name: node.spec.meta.name,
					version: node.spec.meta.version,
					spec: node.spec,
					component_id: node.component_id,
					component_version: node.component_version
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

// Processes each action recursively one by one
// Once the new schema is out we shouldn't need this function anymore
// export const processResource = (
// 	resource: ResourceV1,
// 	fn: (resource: ActionResource) => void,
// 	callback?: (resource: ResourceV1) => void
// ) => {
// 	// The statements needs to be processed recursively indepedently
// 	const processStatement = (statement: StatementV1) => {
// 		if (isSequence(statement)) for (const el of statement.sequence) processStatement(el)
// 		else if (isParallel(statement)) for (const el of statement.parallel) processStatement(el)
// 		else if (isResource(statement)) processResource(statement, fn)
// 	}
// 	// Agents can have nested agents and actions, in sequence or parallel
// 	if (isAgent(resource)) processStatement(resource.spec.agent)
// 	// An action is the final base case, so it can only have code
// 	// and no nested resources
// 	if (isAction(resource)) fn(resource)
// 	// Once we've done everything up until this point we're done
// 	// (only the top call to processStatement will have a callback)
// 	callback?.(resource)
// }

export const canvasStore = $state<Canvas[]>([])

export const openAgents = $state<OpenAgents>({ test_agent: false })

// Extract all actions from the resource
// const actionsStoreState = $derived.by<Action[]>(() => {
// 	const actions: Action[] = []
// 	if (!canvasStore[0]) return actions
// 	processResource(canvasStore[0].resource, resource => actions.push(resource))
// 	return actions
// })
// export const actionsStore = () => actionsStoreState

// TODO: type this properly
export const loadAgent = (resource: Agent) => {
	// Since we only support one tab for now, replace the entire store
	canvasStore.length = 0

	canvasStore.push({ resource })

	console.log('Loaded resource', resource)
}

// TODO: implement
export const updateAction = async (action: Action) => {
	// const store = $state.snapshot(canvasStore)
	// let newAction = action
	// await new Promise<StatementV1>(resolve =>
	// 	processResource(
	// 		store[0].resource,
	// 		(resource: ActionResource) => {
	// 			if (resource.key === action.key) {
	// 				Object.assign(resource, action)
	// 				newAction = Object.assign({}, resource, action)
	// 			}
	// 		},
	// 		resolve
	// 	)
	// )
	// // Update the canvas store again
	// // not perfect but good enough for the poc, we'll have
	// // to change it when we add more canvases either way
	// loadResource(store[0].resource)
	return action
}
