import { getCurrentFlow, getCurrentFlowId, getNodes } from '$lib/stores/canvas.svelte'
import { page } from '$app/state'
import { updateComponentPositions } from '$lib/actions/components'
import type { Uuid } from '$lib/types/agent'
/*
{
	targetNode: Node | null
	nodes: Node[]
	event: MouseEvent | TouchEvent
}
*/
export const handleDragStop = async () => {
	console.log('handleDragStop')

	// if current flow id is not defined, we're at the project level
	const isRootLevel = !getCurrentFlowId()
	const parentId = isRootLevel ? page.params.id : getCurrentFlow()?.component_id
	const parent = isRootLevel ? page.data.project : getCurrentFlow()?.spec
	if (!parentId) return console.error('No parent id')

	// save all nodes as they are laid out right now in the current component
	const parentNodes = new Set(Object.keys(parent?.spec.nodes ?? {}))
	console.log(parentNodes, parent)
	const nodes = getNodes().filter(node => parentNodes.has(node.id)) // so only real nodes are included
	if (!nodes.length) return

	await updateComponentPositions(
		parentId as Uuid,
		Object.fromEntries(
			nodes.map(node => [
				node.id,
				{
					x: node.position.x,
					y: node.position.y
				}
			])
		)
	)
}
