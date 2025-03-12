import type { Uuid, Action, Flow, Node as TriNode, Endpoint } from './agent'
import type { Node as XyNode } from '@xyflow/svelte'

// Custom data passed to each node
export interface NodeData {
	component_name: string
	component_version: number
	component_id: Uuid
	spec: Flow | Action | Endpoint
	state?: 'success' | 'error' | 'running'
	inputs?: TriNode['inputs']
	extended?: {
		height: number
	}
	[key: string]: unknown
}

export type NodeType = 'endpoint-node' | 'flow-node' | 'action-node' | 'open-flow-node'

export type Node = XyNode<NodeData, NodeType> & {
	id: Uuid
}

// Visual properties of a node
export interface NodeProps {
	expanded: boolean
	deleted: boolean
	creating: boolean
}
