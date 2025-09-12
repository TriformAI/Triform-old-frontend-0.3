import { useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import type { OnConnectEnd } from '@xyflow/svelte'
import { type CanvasNode } from '$lib/types/canvas'
import { updateComponent } from '$lib/actions/components'
import { canvasState } from '$lib/stores/canvas.svelte'

import type { UUID as Uuid } from 'crypto'
import {
	addEdge,
	getEdges,
	getNodes,
	getVisibleComponent,
	getCurrentContainer,
	setEdges,
	setNodes,
	refreshFlow,
	addPort
} from '$lib/stores/canvas.svelte'
import { getNodeSelector } from '$lib/utils/getNodeSelector'
import type { FinalConnectionState } from '@xyflow/system'
import type { resolvedFlowModel, resolvedAgentModel } from '$lib/schemas'
import type * as z from 'zod'
import { toast } from 'svelte-sonner'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

async function handleGhostConnection(connectionState: FinalConnectionState) {
	if (!connectionState.fromNode || !connectionState.fromHandle || !connectionState.toHandle || !connectionState.toNode) return

	let newHandle

	// we have a couple cases:
	// 2. from is a ghost port and we're dropping on a regular port
	if (connectionState.fromHandle?.id?.startsWith('ghost-')) {
		newHandle = connectionState.toHandle.id!
		// 2.2 from is an IO node
		// -> create a new input/output on the container
		if (connectionState.fromNode.type === 'input-node')
			await addPort('container', connectionState.toHandle.id!, {}, 'input')
		else if (connectionState.fromNode.type === 'output-node')
			await addPort('container', connectionState.toHandle.id!, {}, 'output')
		// 2.1 from is a normal node
		// -> create a new port on the from node
		else
			await addPort(connectionState.fromNode.id, connectionState.toHandle.id!, {}, connectionState.fromHandle.type === 'source' ? 'output' : 'input')
	}
	else {
		if (!connectionState.toNode) return
		newHandle = connectionState.fromHandle.id!
		// 1. from is a regular port and we're dropping on a ghost port on:
		// 1.2 an IO node
		// -> create a new input/output on the container
		if (connectionState.toNode?.type === 'input-node')
			await addPort('container', connectionState.fromHandle.id!, {}, 'input')
		else if (connectionState.toNode?.type === 'output-node')
			await addPort('container', connectionState.fromHandle.id!, {}, 'output')
		// 1.1 a normal node
		// -> create a new port on the to node
		else
			await addPort(connectionState.toNode.id, connectionState.fromHandle.id!, {}, connectionState.toHandle.type === 'source' ? 'output' : 'input')
	}

	const source = connectionState.fromHandle.type === 'source'
		? { id: connectionState.fromNode.id, handle: newHandle }
		: { id: connectionState.toNode.id, handle: newHandle }
	const target = connectionState.fromHandle.type === 'source'
		? { id: connectionState.toNode.id, handle: newHandle }
		: { id: connectionState.fromNode.id, handle: newHandle }

	addEdge(source, target)
}

async function handleRegularConnection(connectionState: FinalConnectionState) {
	// Figure out which side is the source and which is the target
	const fromIsTarget = connectionState.fromHandle!.type === 'target'
	const sourceId = fromIsTarget ? connectionState.toNode?.id : connectionState.fromNode?.id
	const sourceHandle = fromIsTarget ? connectionState.toHandle?.id : connectionState.fromHandle?.id
	const targetId = fromIsTarget ? connectionState.fromNode?.id : connectionState.toNode?.id
	const targetHandle = fromIsTarget ? connectionState.fromHandle?.id : connectionState.toHandle?.id

	if (!sourceId || !sourceHandle || !targetId || !targetHandle) {
		return toast.error('Invalid connection')
	}

	const source = {
		id: sourceId,
		handle: sourceHandle
	}
	const target = {
		id: targetId,
		handle: targetHandle
	}

	await addEdge(source, target)
}

function handleVoidDrop(
	connectionState: FinalConnectionState,
	event: MouseEvent | TouchEvent,
	useSvelteFlow: ReturnType<typeof svelteFlowHook>
) {
	const { fromNode, fromHandle } = connectionState
	if (!fromHandle || !fromNode) return

	const sourceNodeId = fromNode.id as Uuid
	const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

	const { screenToFlowPosition } = useSvelteFlow

	const position = screenToFlowPosition({
		x: clientX,
		y: clientY
	})

	const { node, edge } = getNodeSelector(
		sourceNodeId,
		position,
		fromNode as unknown as CanvasNode,
		fromHandle
	)

	setNodes([...getNodes(), node])
	setEdges([...getEdges(), edge])
}

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	canvasState.connecting = false
	canvasState.connectingFrom = undefined

	// Prevent connections between IO nodes
	if (
		['input', 'output'].includes(connectionState.fromHandle?.nodeId?.split(':')[1] ?? '') &&
		['input', 'output'].includes(connectionState.toHandle?.nodeId?.split(':')[1] ?? '')
	) return

	// show node sleector if dropped on empty space
	if (!connectionState.isValid) return handleVoidDrop(connectionState, event, useSvelteFlow)

	// if it's a valid connection, don't show the node selector but instead add the edge
	// Check if user is connecting to a ghost port
	if (connectionState?.toHandle?.id?.startsWith('ghost-') || connectionState?.fromHandle?.id?.startsWith('ghost-'))
		return await handleGhostConnection(connectionState)

	// normal connection between ports
	return await handleRegularConnection(connectionState)
}
