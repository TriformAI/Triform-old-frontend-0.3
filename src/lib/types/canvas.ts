import type { Node as TriNode } from '.'
import type { UUID as Uuid } from 'crypto'
import type { Node as XyNode, Edge as XyEdge, EdgeProps as XyEdgeProps } from '@xyflow/svelte'
import type { FlowContainer } from './flow'

// Visual properties of a node
export interface NodeProps {
	expanded: boolean
	deleted: boolean
	creating: boolean
	isDirty: boolean
	payload: string
}

export const defaultProps: NodeProps = {
	expanded: false,
	deleted: false,
	creating: false,
	isDirty: false,
	payload: ''
}

// Custom data passed to each node
export interface NodeData {
	// The node that's expected on the backend
	trinode: FlowContainer['spec']['nodes'][string]
	isExpanded?: boolean
	// Visual frontend-only props
	props: NodeProps
	[key: string]: unknown
}
export type NodeType = 'agent-node' | 'action-node' | 'flow-node'

export type MetaNodeType =
	| 'selector-node'
	| 'create-node'
	| 'loading-node'
	| 'input-node'
	| 'output-node'
export type MetaNodeData = Omit<NodeData, 'trinode'>

export interface Node extends XyNode<NodeData, NodeType> {
	id: Uuid
	parentId?: Uuid
	type: NodeType
}

export interface MetaNode extends XyNode<MetaNodeData, MetaNodeType> {
	id: `${Uuid}:input` | `${Uuid}:output` | Uuid
	parentId?: Uuid
	type: MetaNodeType
}

export type CanvasNode = Node | MetaNode

export interface EdgeData {
	props: {
		deleted: boolean
	}
	[key: string]: unknown
}

export const defaultEdgeProps: EdgeData['props'] = {
	deleted: false
}

export interface Edge extends XyEdge {
	id: string
	type?: 'default'
	source: string
	target: string
	data: EdgeData
}

export interface EdgeProps extends XyEdgeProps {
	id: Edge['id']
	data: EdgeData
}
