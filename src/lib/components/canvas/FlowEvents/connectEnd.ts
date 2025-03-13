import { type OnConnectEnd, useSvelteFlow as svelteFlowHook, type Edge } from '@xyflow/svelte'
import { type Node } from '$lib/types/flow'
import { nodes, edges, updateNode, publishComponent, getNode } from '$lib/stores/canvas.svelte'
import type { Flow, Uuid } from '$lib/types/agent'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	console.log('end', connectionState)
	// Don't trigger the selector for valid conenctions, or
	// if the origin of the new edge is at the top of a node
	// if (connectionState.isValid || connectionState.fromHandle?.type === 'target') {
	// 	if (!fromNode.parentId) return
	// 	const flow = getNode(fromNode.parentId)
	// 	if (!flow) return
	// 	const data = flow.data as NodeData
	// 	const extended = data.extended?.height ?? 0
	// 	flow.height = (flow.measured?.height ?? 0) - extended
	// 	flow.data.extended = { height: 0 }
	// 	updateNodeInternals(flow.id)

	// 	// If the target was an output handle, add it to the parent flow
	// 	if (toHandle?.id?.endsWith(':output')) {
	// 		if (!('outputs' in data.spec.spec) || !Array.isArray(data.spec.spec.outputs)) return
	// 		if (data.spec.spec.outputs.includes(fromNode.id)) return
	// 		try {
	// 			await updateNode(
	// 				fromNode.parentId as Uuid,
	// 				{
	// 					spec: {
	// 						...data.spec,
	// 						spec: {
	// 							...data.spec.spec,
	// 							outputs: [...data.spec.spec.outputs, fromNode.id]
	// 						}
	// 					} as Flow
	// 				},
	// 				false
	// 			)
	// 			await publishComponent(fromNode.parentId as Uuid)
	// 		} catch (e) {
	// 			console.error('Failed to publish flow', e)
	// 			toast.error('Failed to publish flow')
	// 			return
	// 		}
	// 	}

	// 	return
	// }

	// If the new edge was valid, handle the expansion & any other actions
	if (connectionState.isValid) {
		console.log('valid', connectionState)
		// Handle the new edge case (haha, get it? edges, edge case...)
		handleNewPortConnection(event, connectionState, useSvelteFlow)

		// Remove the extra space that we added to the flow to account for a possible new node
		const { getNode, updateNode } = useSvelteFlow
		const { fromNode } = connectionState
		if (!fromNode?.parentId) return
		const flow = getNode(fromNode.parentId) as Node | undefined
		if (!flow) return
		const extended = flow.data.extended?.height ?? 0
		flow.height = (flow.measured?.height ?? 0) - extended
		flow.data.extended = { height: 0 }
		updateNode(flow.id, flow)
	}
	// Create node selector if the new edge wasn't valid
	else createNodeSelector(event, connectionState, useSvelteFlow)
}

const handleNewPortConnection: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	const { getNode: getFlowNode } = useSvelteFlow
	const { fromNode, toNode, fromHandle, toHandle } = connectionState

	// We have a couple cases here as well
	// 1. Origin or end point is an output handle - create new output
	if (fromHandle?.id?.endsWith(':output') || toHandle?.id?.endsWith(':output')) {
		const parentId = (fromHandle?.id?.endsWith(':output') ? fromNode?.id : toNode?.id) as Uuid
		if (!parentId) return
		const flow = getFlowNode(parentId) as Node | undefined
		if (!flow) return
		// Add the new output to the flow
		const newSpec = Object.assign({}, flow.data.spec) as Flow
		const newOutput = (fromHandle?.id?.endsWith(':output') ? toNode?.id : fromNode?.id) as Uuid
		if (!newOutput || newSpec.spec.outputs?.includes(newOutput)) return
		newSpec.spec.outputs = [...(newSpec.spec.outputs ?? []), newOutput]
		await updateNode(
			parentId,
			{
				spec: newSpec
			},
			false
		)
		// Publish the parent flow
		await publishComponent(parentId)
	}
	// 2. Origin or end point is an input handle - add "parent" to the inputs
	else if (fromHandle?.id?.endsWith(':input') || toHandle?.id?.endsWith(':input')) {
		const parentId = (fromHandle?.id?.endsWith(':input') ? fromNode?.id : toNode?.id) as Uuid
		if (!parentId) return
		const flow = getFlowNode(parentId) as Node | undefined
		if (!flow) return
		// Add the new output to the flow
		const newSpec = Object.assign({}, flow.data.spec) as Flow
		const nodeId = (fromHandle?.id?.endsWith(':input') ? toNode?.id : fromNode?.id) as Uuid
		const node = newSpec.spec.nodes[nodeId]
		if (!node || node.inputs?.includes('parent')) return
		newSpec.spec.nodes[nodeId].inputs = [...(node.inputs ?? []), 'parent']
		await updateNode(
			parentId,
			{
				spec: newSpec
			},
			false
		)
		// Publish the parent flow
		await publishComponent(parentId)
	}
	// 3. Origin is a target handle, end point is a source handle - create connection on origin (target)
	else if (fromHandle?.type === 'target' && toHandle?.type === 'source') {
		const originId = fromNode?.id as Uuid
		const newInput = toNode?.id as Uuid
		if (!originId || !newInput) return
		// Set the input on the origin node
		const node = await getNode(originId)
		if (!node || node.inputs?.includes(newInput)) return
		await updateNode(
			originId,
			{
				inputs: [...(node.inputs ?? []), newInput]
			},
			false
		)
		// Publish the parent flow (will default to saving the project if we're in the root)
		await publishComponent(fromNode?.parentId as Uuid)
	}
	// 4. Origin is a source handle, end point is a target handle - create connection on endpoint (target)
	else if (fromHandle?.type === 'source' && toHandle?.type === 'target') {
		const targetId = toNode?.id as Uuid
		const newInput = fromNode?.id as Uuid
		if (!targetId || !newInput) return
		// Set the input on the origin node
		const node = await getNode(targetId)
		if (!node || node.inputs?.includes(newInput)) return
		await updateNode(
			targetId,
			{
				inputs: [...(node.inputs ?? []), newInput]
			},
			false
		)
		// Publish the parent flow (will default to saving the project if we're in the root)
		await publishComponent(toNode?.parentId as Uuid)
	}
}

const createNodeSelector: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	const { screenToFlowPosition } = useSvelteFlow
	const { fromNode, fromHandle } = connectionState
	if (!fromNode) return

	const sourceNodeId = fromNode.id as Uuid
	const id = crypto.randomUUID()
	const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

	const newNode: Node = {
		id,
		type: 'selector-node',
		// Slight dummy data for validation
		data: {
			component_name: 'Selector',
			component_id: id,
			spec: {}
		},
		// project the screen coordinates to pane coordinates
		position: screenToFlowPosition({
			x: clientX,
			y: clientY
		}),
		// set the origin of the new node so it is centered
		origin: [0.5, 0.0]
	}

	let newEdge: Edge
	// Depending on the type of handle we started dragging from, we have a couple cases
	// 1. The origin handle is an input handle, so the new node is created below as normal
	if (fromHandle?.id?.endsWith(':input'))
		newEdge = {
			source: sourceNodeId,
			sourceHandle: fromHandle.id,
			target: id,
			// Not super smart to pass data through the edge and not the node, but the node is so strictly typed right now
			// that I think this might be the best way _for now_
			data: {
				// Make the node get added as a child instead of as a sibling
				addAsChild: true
			},
			// Important that this ends with nodeSelector, as that's how we find the source node in the selector
			id: `${sourceNodeId}:nodeSelector`
		}
	// 2. The origin handle is an output handle
	// In this case I think we need to check where the user dropped the handle, and if it's within the flow, create a node within the flow connected to the output
	// But if it's dropped outside, we should create a downstream node of this flow, so a sibling basically
	else if (fromHandle?.id?.endsWith(':output')) {
		// For now I think it's enough that we create it outside of the flow, ie as a sibling
		newEdge = {
			source: sourceNodeId,
			target: id,
			sourceHandle: sourceNodeId,
			id: `${sourceNodeId}:nodeSelector`
		}
		console.log('output')
	}
	// 3. The origin handle is on a node, but it's a target handle, so the new node is created "above"
	else if (fromHandle?.type === 'target') {
		console.log('target')
		newEdge = {
			source: id,
			target: sourceNodeId,
			id: `${id}:nodeSelector`
		}
	}
	// 4. The origin handle is on a node, but it's a source handle, so the new node is created as usual; below
	else if (fromHandle?.type === 'source')
		newEdge = {
			source: sourceNodeId,
			target: id,
			id: `${sourceNodeId}:nodeSelector`
		}

	if (!newEdge) return
	console.log('newedge', newEdge)

	nodes.update(n => [...n, newNode])
	edges.update(e => [...e, newEdge])
}
