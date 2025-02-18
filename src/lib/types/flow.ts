import type { Uuid, Action, Agent } from './agent'
import type { Node as XyNode } from '@xyflow/svelte'

// Custom data passed to each node
export interface NodeData {
	component_name: string
	component_version: number
	component_id: Uuid
	spec: Agent | Action
	state?: 'success' | 'error' | 'running'
	[key: string]: unknown
}

export type NodeType =
	| 'endpoint-node'
	| 'agent-node'
	| 'action-node'
	| 'open-agent-node'
	| 'selector-node'

export type Node = XyNode<NodeData, NodeType> & {
	id: Uuid
}

// Visual properties of a node
export interface NodeProps {
	expanded: boolean
	deleted: boolean
}
