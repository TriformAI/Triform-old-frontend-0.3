import type { Node as TriNode } from './'
import type { UUID as Uuid } from 'crypto'
import type { Node as XyNode, Edge as XyEdge, EdgeProps as XyEdgeProps } from '@xyflow/svelte'

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
	trinode: TriNode
	isExpanded?: boolean
	// Visual frontend-only props
	props: NodeProps
	[key: string]: unknown
}

export type TemporaryNodeData = Omit<NodeData, 'trinode'>

export type NodeType =
	| 'endpoint-node'
	| 'action-node'
	| 'flow-node'
	| 'selector-node'
	| 'loading-node'

export interface Node
	extends XyNode<NodeData, Exclude<NodeType, 'selector-node' | 'loading-node'>> {
	id: Uuid
	parentId?: Uuid
	type: Exclude<NodeType, 'selector-node' | 'loading-node'>
}

export interface TemporaryNode
	extends XyNode<TemporaryNodeData, 'selector-node' | 'loading-node' | 'parent-node'> {
	id: Uuid
	parentId?: Uuid
	type: 'selector-node' | 'loading-node' | 'parent-node'
}

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
	id: `${Uuid}:${Uuid | 'nodeSelector' | 'input'}`
	type?: 'default'
	source: Uuid | 'input'
	target: Uuid
	data: EdgeData
}

export interface EdgeProps extends XyEdgeProps {
	id: Edge['id']
	data: EdgeData
}
