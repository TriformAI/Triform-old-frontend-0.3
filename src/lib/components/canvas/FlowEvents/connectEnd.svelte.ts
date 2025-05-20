import { type OnConnectEnd, useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import { addTemporaryNode } from '$lib/utils/temporaryNode'
import { defaultEdgeProps } from '$lib/types/flow'
import type { Uuid } from '$lib/types/agent'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	console.info(connectionState)

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
