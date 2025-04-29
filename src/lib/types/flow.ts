import type { Uuid, Node as TriNode } from './agent'
import type { Node as XyNode, Edge as XyEdge, EdgeProps as XyEdgeProps } from '@xyflow/svelte'

// Visual properties of a node
export interface NodeProps {
	expanded: boolean
	deleted: boolean
	creating: boolean
	isDirty: boolean
	openPanel: string
}

export const defaultProps: NodeProps = {
	expanded: false,
	deleted: false,
	creating: false,
	isDirty: false,
	openPanel: ''
}

// Custom data passed to each node
export interface NodeData {
	// The node that's expected on the backend
	trinode: TriNode
	isExpanded?: boolean
	// Visual frontend-only props
	props: NodeProps
	path: Uuid[]
	[key: string]: unknown
}

export type TemporaryNodeData = Omit<NodeData, 'trinode'> & {
	addAsChild: boolean
}

export type NodeType =
	| 'endpoint-node'
	| 'action-node'
	| 'flow-node'
	| 'open-flow-node'
	| 'selector-node'

export interface Node extends XyNode<NodeData, Exclude<NodeType, 'selector-node'>> {
	id: Uuid
	parentId?: Uuid
	type: Exclude<NodeType, 'selector-node'>
}

export interface TemporaryNode extends XyNode<TemporaryNodeData, 'selector-node'> {
	id: Uuid
	parentId?: Uuid
	type: 'selector-node'
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
	id: `${Uuid}:${Uuid | 'nodeSelector'}${':input' | ':output' | ''}`
	type?: 'default'
	source: Uuid
	target: Uuid
	sourceHandle?: `${Uuid}${':input' | ''}`
	targetHandle?: `${Uuid}${':output' | ''}`
	data: EdgeData
}

export interface EdgeProps extends XyEdgeProps {
	id: Edge['id']
	data: EdgeData
}
