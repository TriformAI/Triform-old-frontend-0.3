import type {
	Canvas,
	ActionResource,
	AgentResource,
	Statement,
	Sequence,
	Parallel
} from '$lib/stores/canvas.svelte'
import type { Edge, Node } from '@xyflow/svelte'

import dagre from '@dagrejs/dagre'

type ParsedGraph = { nodes: Node[]; edges: Edge[] }

export const parseTree = (canvas: Canvas, openAgents: { [key: string]: boolean }): ParsedGraph => {
	const isAction = (resource: Statement): resource is ActionResource => {
		return 'resource' in resource && resource.resource == 'action'
	}
	const isAgent = (resource: Statement): resource is AgentResource => {
		return 'resource' in resource && resource.resource == 'agent'
	}
	const isSequence = (resource: Statement): resource is Sequence => {
		return 'sequence' in resource
	}
	const isParallel = (resource: Statement): resource is Parallel => {
		return 'parallel' in resource
	}

	const parseStatement = (resource: Statement, parentId?: string): ParsedGraph => {
		if (isAction(resource)) {
			return parseAction(resource, parentId)
		} else if (isAgent(resource)) {
			return parseAgent(resource, parentId)
		} else if (isSequence(resource)) {
			return parseSequence(resource, parentId)
		} else if (isParallel(resource)) {
			return parseParallel(resource, parentId)
		} else {
			throw new Error('Canvas contains unknown type of resource ' + JSON.stringify(resource))
		}
	}

	const parseAgent = (resource: AgentResource, parentId?: string): ParsedGraph => {
		const nodeType = openAgents[resource.key] ? 'open-agent-node' : 'agent-node'

		const agentNode: Node = {
			id: resource.key,
			type: nodeType,
			data: {
				name: resource.spec.name,
				version: resource.spec.version,
				id: resource.id
			},
			position: { x: 0, y: 0 },
			parentId,
			extent: parentId && !openAgents[resource.key] ? 'parent' : undefined
		}
		const agentEdges: Edge[] = (resource.inputs ?? []).map(input => ({
			id: `${input}-${resource.key}`,
			source: input,
			target: resource.key,
			type: 'floating'
		}))

		const children = openAgents[resource.key]
			? parseStatement(resource.spec.agent, resource.key)
			: { nodes: [], edges: [] }

		return { nodes: [agentNode, ...children.nodes], edges: [...agentEdges, ...children.edges] }
	}

	const parseAction = (resource: ActionResource, parentId?: string): ParsedGraph => {
		const node: Node = {
			id: resource.key,
			type: 'action-node',
			parentId,
			extent: parentId ? 'parent' : undefined,
			position: { x: 0, y: 0 },
			data: {
				name: resource.spec!.name,
				version: resource.spec!.version,
				id: resource.id,
				files: {
					'action.py': resource.spec!.action.source,
					'README.md': resource.spec!.action.readme,
					'requirements.txt': resource.spec!.action.deps
				}
			}
		}

		const edges = (resource.inputs ?? []).map(input => ({
			id: `${input}-${resource.key}`,
			source: input,
			target: resource.key,
			type: 'floating'
		}))
		return { nodes: [node], edges }
	}

	const parseSequence = (resource: Sequence, parentId?: string): ParsedGraph => {
		return resource.sequence
			.map(s => parseStatement(s, parentId))
			.reduce(
				(ret, cur) => ({
					nodes: [...ret.nodes, ...cur.nodes],
					edges: [...ret.edges, ...cur.edges]
				}),
				{ nodes: [], edges: [] }
			)
	}

	const parseParallel = (resource: Parallel, parentId?: string): ParsedGraph => {
		return resource.parallel
			.map(p => parseStatement(p, parentId))
			.reduce(
				(ret, cur) => ({
					nodes: [...ret.nodes, ...cur.nodes],
					edges: [...ret.edges, ...cur.edges]
				}),
				{ nodes: [], edges: [] }
			)
	}

	return parseStatement(canvas.resource)
}

export const getLayoutedNodes = (nodes: Node[], edges: Edge[]) => {
	const graph = new dagre.graphlib.Graph()
	graph.setDefaultEdgeLabel(() => ({}))
	graph.setGraph({ rankdir: 'TB' })
	const nodeSize = 60

	for (const node of nodes) {
		const width = nodeSize
		const height = nodeSize + (node.data.name as string).length * 3
		graph.setNode(node.id, {
			width,
			height
		})
	}

	for (const edge of edges) graph.setEdge(edge.source, edge.target)

	dagre.layout(graph)

	return nodes.map(n => {
		const d = graph.node(n.id)
		n.position = {
			x: d.x - nodeSize / 2,
			y: d.y - nodeSize / 2
		}
		return n
	})
}