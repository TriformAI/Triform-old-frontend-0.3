import { getCurrentContainer } from '$lib/stores/canvas.svelte'
import { toast } from 'svelte-sonner'
import { isFlow } from '$lib/schemas'
import { updateComponent } from '$lib/actions/components'
import type { CanvasNode } from '$lib/types/canvas'
import type { NodeTargetEventWithPointer } from '@xyflow/svelte'
import { unresolveComponent } from '$lib/utils/unresolveComponent'

/*
{
	targetNode: Node | null
	nodes: Node[]
	event: MouseEvent | TouchEvent
}
*/
// TODO: add support for re-ordering nodes in projects & agent nodes
export const handleDragStop: NodeTargetEventWithPointer<
	MouseEvent | TouchEvent,
	CanvasNode
> = async (params: {
	targetNode: CanvasNode | null
	nodes: CanvasNode[]
	event: MouseEvent | TouchEvent
}) => {
	const { targetNode, nodes, event } = params
	const currentContainer = getCurrentContainer()
	console.log('currentContainer', currentContainer)
	if (!currentContainer) return toast.error('No parent found')
	if (!isFlow(currentContainer)) return toast.error('Cannot move nodes in this container')

	const updatedNodes = new Map<string, CanvasNode>()
	for (const node of nodes) {
		if (node.type === 'input-node') {
			currentContainer.spec.io_nodes.input = node.position
			continue
		}
		if (node.type === 'output-node') {
			currentContainer.spec.io_nodes.output = node.position
			continue
		}
		updatedNodes.set(node.id, node)
	}
	for (const id of Object.keys(currentContainer.spec.nodes)) {
		const updatedNode = updatedNodes.get(id)
		if (!updatedNode) continue
		currentContainer.spec.nodes[id].position = updatedNode.position
	}
	console.log('currentContainer', currentContainer)

	const unresolvedComponent = unresolveComponent(currentContainer)
	console.log('unresolvedComponent', unresolvedComponent)

	await updateComponent(unresolvedComponent)
}
