import { useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import type { OnConnectEnd } from '@xyflow/svelte'
import { type CanvasNode } from '$lib/types/canvas'
import { updateComponent } from '$lib/actions/components'

import type { UUID as Uuid } from 'crypto'
import {
	addEdge,
	getEdges,
	getNodes,
	getVisibleComponent,
	getCurrentContainer,
	setEdges,
	setNodes,
	refreshFlow
} from '$lib/stores/canvas.svelte'
import { getNodeSelector } from '$lib/utils/getNodeSelector'
import type { FinalConnectionState } from '@xyflow/system'
import type { resolvedFlowModel, resolvedAgentModel } from '$lib/schemas'
import type * as z from 'zod'
import { toast } from 'svelte-sonner'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

async function handleGhostConnection(connectionState: FinalConnectionState) {
	if (!connectionState.fromNode || !connectionState.fromHandle) {
		return
	}

	const currentContainer = getCurrentContainer() as
		| z.infer<typeof resolvedFlowModel>
		| z.infer<typeof resolvedAgentModel>

	const isCreatingInput = connectionState.fromHandle!.type === 'target'

	const fromComponent = $state.snapshot(getVisibleComponent(connectionState.fromNode.id))

	const portKey = connectionState.fromHandle.id!

	const specKey = isCreatingInput ? 'inputs' : 'outputs'

	if (!(specKey in currentContainer.spec) || !(specKey in fromComponent.spec)) {
		return
	}

	// Horrific conditional purely to make TS be quiet
	if (isCreatingInput && 'inputs' in currentContainer.spec && 'inputs' in fromComponent.spec) {
		currentContainer.spec.inputs[portKey] = fromComponent.spec.inputs[portKey]
	} else if ('outputs' in currentContainer.spec && 'outputs' in fromComponent.spec) {
		currentContainer.spec.outputs[portKey] = fromComponent.spec.outputs[portKey]
	}

	await updateComponent(currentContainer)
	refreshFlow()

	// Figure out which side is the source and which is the target
	const source = {
		id: isCreatingInput ? `${currentContainer.id}:input` : connectionState.fromNode?.id,
		handle: portKey
	}

	const target = {
		id: isCreatingInput ? connectionState.fromNode?.id : `${currentContainer.id}:output`,
		handle: portKey
	}

	await addEdge(source, target)
}

async function handleRegularConnection(connectionState: FinalConnectionState) {
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
	if (!source.id) return toast.error('Invalid source')

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
	// Prevent connections between IO nodes
	if (
		['input', 'output'].includes(connectionState.fromHandle?.nodeId?.split(':')[1] ?? '') &&
		['input', 'output'].includes(connectionState.toHandle?.nodeId?.split(':')[1] ?? '')
	) {
		return
	}

	// if it's a valid connection, don't show the node selector but instead add the edge
	if (connectionState.isValid) {
		// Check if user is connectiong to a ghost port
		if (connectionState?.toHandle?.id?.startsWith('ghost-')) {
			return await handleGhostConnection(connectionState)
		}

		return await handleRegularConnection(connectionState)
	}

	// Edge dropped on empty space, show node selector

	handleVoidDrop(connectionState, event, useSvelteFlow)
}
