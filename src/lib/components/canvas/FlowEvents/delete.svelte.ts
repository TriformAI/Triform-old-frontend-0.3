import { deleteNode } from '$lib/stores/canvas.svelte'
import type { Node } from '$lib/types/flow'

export const handleDelete = async ({ nodes }: { nodes: Node[] }) => {
	for (const node of nodes) {
		await deleteNode(node.id)
	}
}
