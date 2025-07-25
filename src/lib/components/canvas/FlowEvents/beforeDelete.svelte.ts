import { confirmStore } from '$lib/stores/confirm.svelte'
import { toast } from 'svelte-sonner'
import { type TemporaryNode } from '$lib/types/flow'
import { type Node } from '$lib/types'

export const handleBeforeDelete = async ({ nodes }: { nodes: (Node | TemporaryNode)[] }) => {
	const allNodes = Object.values(nodes)
	const numNodes = allNodes.length
	const isMultipleNodes = numNodes > 1

	// Always allow deleting of selector nodes
	if (allNodes.some(node => ['selector-node', 'loading-node'].includes(node.type))) {
		return true
	}

	// Don't allow deleting of endpoint nodes
	if (allNodes.find(node => node.type === 'endpoint-node')) {
		toast.error("You can't delete an endpoint node.")
		return false
	}

	// For other nodes – Ask user for confirmation
	const isConfirmed = await confirmStore.show({
		title: 'Are you sure?',
		message: `Please confirm that you want to delete ${isMultipleNodes ? `these ${numNodes} nodes` : 'this node'}`
	})

	return isConfirmed
}
