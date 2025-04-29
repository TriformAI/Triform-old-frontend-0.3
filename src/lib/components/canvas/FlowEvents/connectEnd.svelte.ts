import { type OnConnectEnd, useSvelteFlow as svelteFlowHook } from '@xyflow/svelte'
import { nodes, updateNode, isFlow, project } from '$lib/stores/canvas.svelte'
import { type Edge, defaultEdgeProps } from '$lib/types/flow'
import type { Flow, Uuid } from '$lib/types/agent'
import { toast } from 'svelte-sonner'
import { publishComponent } from '$lib/actions/components'
import { saveProject } from '$lib/actions/project'
import { addNodeSelector } from '$lib/utils/addNodeSelector'

type ConnectEnd = AddParameters<OnConnectEnd, [ReturnType<typeof svelteFlowHook>]>

export const handleConnectEnd: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	// If the new edge was connected to a valid node, handle the new "edge" case (haha, get it? edges, edge case...)
	if (connectionState.isValid) handleNewPortConnection(event, connectionState, useSvelteFlow)
	// If it wasn't valid, show the node selector instead
	else createNodeSelector(event, connectionState, useSvelteFlow)
}

const handleNewPortConnection: ConnectEnd = async (_event, connectionState, _useSvelteFlow) => {
	const { fromNode, toNode, fromHandle, toHandle } = connectionState

	// We have a couple cases here as well
	// 1. Origin or end point is an output handle - create new output
	if (fromHandle?.id?.endsWith(':output') || toHandle?.id?.endsWith(':output')) {
		const parentId = (fromHandle?.id?.endsWith(':output') ? fromNode?.id : toNode?.id) as Uuid
		if (!parentId) return

		const flow = nodes[parentId]
		if (!flow || !isFlow(flow.data.trinode)) return
		// Clone it so we don't modify the original before we commit the updates with updateNode
		const parent = structuredClone($state.snapshot(flow.data.trinode))

		// Add the new output to the flow
		const newOutput = (fromHandle?.id?.endsWith(':output') ? toNode?.id : fromNode?.id) as Uuid
		const outputs = parent.spec.spec.outputs ?? []
		if (!newOutput || outputs.includes(newOutput)) {
			console.warn('Tried to add an output that already exists')
			return
		}
		parent.spec.spec.outputs = [...outputs, newOutput]
		const previous = updateNode(parentId, parent)
		// Publish the parent flow
		try {
			await publishComponent(parent.spec)
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
			for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
		}
	}

	// 2. Origin or end point is an input handle - add "parent" to the inputs
	else if (fromHandle?.id?.endsWith(':input') || toHandle?.id?.endsWith(':input')) {
		const parentId = (fromHandle?.id?.endsWith(':input') ? fromNode?.id : toNode?.id) as Uuid
		if (!parentId) return

		const flow = nodes[parentId]
		if (!flow) return
		const parent = structuredClone($state.snapshot(flow.data.trinode))

		// Add the new output to the flow
		const newSpec = Object.assign({}, parent.spec) as Flow
		const nodeId = (fromHandle?.id?.endsWith(':input') ? toNode?.id : fromNode?.id) as Uuid
		const node = newSpec.spec.nodes[nodeId]
		if (!node || node.inputs?.includes('parent')) return

		newSpec.spec.nodes[nodeId].inputs = [...(node.inputs ?? []), 'parent']
		const previous = updateNode(parentId, {
			...flow.data.trinode,
			spec: newSpec
		})
		// Publish the parent flow
		try {
			await publishComponent(parent.spec)
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
			for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
		}
	}

	// 3. Origin is a target handle, end point is a source handle - create connection on origin (target)
	else if (fromHandle?.type === 'target' && toHandle?.type === 'source') {
		const originId = fromNode?.id as Uuid
		const newInput = toNode?.id as Uuid
		if (!originId || !newInput) return

		// Set the input on the origin node
		const node = nodes[originId]
		if (!node || node.data.trinode.inputs?.includes(newInput)) return

		const previous = updateNode(originId, {
			...node.data.trinode,
			inputs: [...(node.data.trinode.inputs ?? []), newInput]
		})
		// Publish the parent flow (will default to saving the project if we're in the root)
		const parentNode = fromNode?.parentId as Uuid
		if (parentNode) {
			try {
				await publishComponent(nodes[originId].data.trinode.spec)
			} catch (e) {
				console.error('Failed to publish component', e)
				toast.error('Failed to publish component')
				for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
			}
		} else {
			try {
				const currentProject = project()
				if (!currentProject) throw new Error('No project found')
				await saveProject(currentProject)
			} catch (e) {
				console.error('Failed to save project', e)
				toast.error('Failed to save project')
				for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
			}
		}
	}

	// 4. Origin is a source handle, end point is a target handle - create connection on endpoint (target)
	else if (fromHandle?.type === 'source' && toHandle?.type === 'target') {
		const targetId = toNode?.id as Uuid
		const newInput = fromNode?.id as Uuid
		if (!targetId || !newInput) return
		// Set the input on the origin node
		const node = nodes[targetId]
		if (!node || node.data.trinode.inputs?.includes(newInput)) return
		const previous = updateNode(targetId, {
			...node.data.trinode,
			inputs: [...(node.data.trinode.inputs ?? []), newInput]
		})
		// Publish the parent flow or save the project if we're in the root
		const parentNode = nodes[toNode?.parentId as Uuid]
		if (!parentNode) {
			try {
				const currentProject = project()
				if (!currentProject) throw new Error('No project found')
				await saveProject(currentProject)
			} catch (e) {
				console.error('Failed to save project', e)
				toast.error('Failed to save project')
				for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
			}
		} else {
			try {
				await publishComponent(nodes[targetId].data.trinode.spec)
			} catch (e) {
				console.error('Failed to publish component', e)
				toast.error('Failed to publish component')
				for (const [id, node] of Object.entries(previous)) updateNode(id as Uuid, node)
			}
		}
	}
}

const createNodeSelector: ConnectEnd = async (event, connectionState, useSvelteFlow) => {
	const { screenToFlowPosition } = useSvelteFlow
	const { fromNode, fromHandle } = connectionState
	if (!fromNode) return

	const sourceNodeId = fromNode.id as Uuid
	const nodeSelectorId = crypto.randomUUID()
	const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

	let newEdge: Edge | undefined
	let addAsChild = false

	// Depending on the type of handle we started dragging from, we have a couple cases
	// 1. The origin handle is an input handle, so the new node is created below as normal
	if (fromHandle?.id?.endsWith(':input')) {
		addAsChild = true
		newEdge = {
			source: sourceNodeId,
			sourceHandle: fromHandle.id as Uuid,
			target: nodeSelectorId,
			id: `${sourceNodeId}:nodeSelector`,
			data: { props: defaultEdgeProps }
		}
	}

	// 2. The origin handle is an output handle
	// In this case I think we need to check where the user dropped the handle, and if it's within the flow, create a node within the flow connected to the output
	// But if it's dropped outside, we should create a downstream node of this flow, so a sibling basically
	// TODO: the edge bends in the wrong way here, so we'll have to make the drag event start from the regular handle
	// and not the output handle (small visual thing)
	else if (fromHandle?.id?.endsWith(':output')) {
		// For now I think it's enough that we create it outside of the flow, ie as a sibling
		newEdge = {
			source: sourceNodeId,
			target: nodeSelectorId,
			sourceHandle: sourceNodeId,
			id: `${sourceNodeId}:nodeSelector`,
			data: { props: defaultEdgeProps }
		}
	}

	// 3. The origin handle is on a node, but it's a target handle, so the new node is created "above"
	else if (fromHandle?.type === 'target') {
		console.log('target')
		newEdge = {
			source: nodeSelectorId,
			target: sourceNodeId,
			id: `${nodeSelectorId}:nodeSelector`,
			data: { props: defaultEdgeProps }
		}
	}

	// 4. The origin handle is on a node, but it's a source handle, so the new node is created as usual; below
	else if (fromHandle?.type === 'source') {
		newEdge = {
			source: sourceNodeId,
			target: nodeSelectorId,
			id: `${sourceNodeId}:nodeSelector`,
			data: { props: defaultEdgeProps }
		}
	}

	// This shouldn't happen, but... you never know
	else {
		throw new Error('Unknown handle type')
	}

	if (!newEdge) return

	const position = screenToFlowPosition({
		x: clientX,
		y: clientY
	})

	addNodeSelector(newEdge, position, nodeSelectorId, addAsChild)
}
