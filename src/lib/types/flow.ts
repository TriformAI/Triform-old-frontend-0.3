import type { Uuid, Node as TriNode } from './agent'
import type { Node as XyNode } from '@xyflow/svelte'

// Visual properties of a node
export interface NodeProps {
	expanded: boolean
	deleted: boolean
	creating: boolean
	isDirty: boolean
}

export const defaultProps: NodeProps = {
	expanded: false,
	deleted: false,
	creating: false,
	isDirty: false
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
