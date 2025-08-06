import { type OnConnectEnd, useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import { defaultEdgeProps, type Node } from '$lib/types/canvas'
import type { UUID as Uuid } from 'crypto'
import { addEdge, getEdges, getNodes, setEdges, setNodes } from '$lib/stores/canvas.svelte'
import { getNodeSelector } from '$lib/utils/getNodeSelector'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	// if it's a valid connection, don't show the node selector but instead add the edge
	if (connectionState.isValid) {
		// Figure out which side is the source and which is the target
		const fromIsTarget = connectionState.fromHandle!.type === 'target'
		const source = {
			id: fromIsTarget ? connectionState.toNode?.id : connectionState.fromNode?.id,
			handle: fromIsTarget ? connectionState.toHandle?.id : connectionState.fromHandle?.id
		}
		const target = {
			id: fromIsTarget ? connectionState.fromNode?.id : connectionState.toNode?.id,
			handle: fromIsTarget ? connectionState.fromHandle?.id : connectionState.toHandle?.id
		}

		await addEdge(source, target)

		return
	}

	const { fromNode, fromHandle } = connectionState
	if (!fromHandle || !fromNode) return

	const sourceNodeId = fromNode.id as Uuid
	const nodeSelectorId = crypto.randomUUID()
	const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

	const newEdge = {
		source: sourceNodeId,
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

	const { node, edge } = getNodeSelector(sourceNodeId, position, fromNode.type === 'parent-node')

	setNodes([...getNodes(), node])
	setEdges([...getEdges(), edge])
}
