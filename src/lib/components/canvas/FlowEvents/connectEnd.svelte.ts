import { type OnConnectEnd, useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import { addTemporaryNode } from '$lib/utils/temporaryNode'
import { defaultEdgeProps, type Node } from '$lib/types/flow'
import type { Uuid } from '$lib/types/agent'
import { addEdge } from '$lib/stores/canvas.svelte'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	// if it's a valid connection, don't show the node selector
	if (connectionState.isValid) {
		// Figure out which side is the source and which is the target
		const fromIsTarget = connectionState.fromHandle!.type === 'target'
		const source = fromIsTarget ? connectionState.toNode : connectionState.fromNode
		const target = fromIsTarget ? connectionState.fromNode : connectionState.toNode

		await addEdge(target as unknown as Node, source!.id as Uuid | 'parent')

		return
	}

	const { fromNode, fromHandle } = connectionState
	if (!fromHandle || !fromNode) return

	const sourceNodeId = fromNode.id as Uuid
	const nodeSelectorId = crypto.randomUUID()
	const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

	const newEdge = {
		source: sourceNodeId,
		sourceHandle: fromHandle.id as Uuid,
		target: nodeSelectorId,
		id: `${sourceNodeId}:nodeSelector`,
		data: { props: defaultEdgeProps }
	}

	const { screenToFlowPosition } = useSvelteFlow

	const position = screenToFlowPosition({
		x: clientX,
		y: clientY
	})

	console.info(fromNode.type)

	addTemporaryNode({
		type: 'selector',
		position,
		nodeId: nodeSelectorId,
		sourceNodeId,
		sourceIsParent: fromNode.type === 'parent-node',
		edge: newEdge
	})
}
