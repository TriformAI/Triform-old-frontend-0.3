import type { Node, NodeType } from '$lib/types/flow'
import type { Component } from 'svelte'

import { SvelteMap } from 'svelte/reactivity'
import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
import { openWindow } from './windows.svelte'
import { removeNode, addDownstreamNode, setNodeProps } from './canvas.svelte'
import { confirmStore } from './confirm.svelte'
import { toast } from 'svelte-sonner'

import CodeEditorWindow from '$lib/components/windows/CodeEditorWindow.svelte'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconAdd from '~icons/material-symbols/add-diamond-outline'
import IconEditor from '~icons/material-symbols/code-blocks-outline'

export type onClickFn = (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => void
interface ActionItem {
	label: string
	icon: Component
	isDangerous: boolean
	onClick: onClickFn
}

const actionsMapStore = $state(new SvelteMap<NodeType, ActionItem[]>())
export const actionsMap = () => actionsMapStore

/*
  Generic functions used by multiple nodes
*/
const addAction = {
	label: 'Add Action',
	icon: IconAdd,
	isDangerous: false,
	onClick: (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		addDownstreamNode('root', undefined, node.id)

		const { getNodes, getZoom, setCenter } = useSvelteFlow

		setTimeout(() => {
			const nodes = getNodes()
			const pos = nodes[nodes.length - 1].position
			if (!pos) return
			const currentZoom = getZoom()
			setCenter(pos.x + 40, pos.y + 100, { zoom: currentZoom, duration: 500 })
		}, 100)
	}
}

const deleteNode = {
	label: 'Delete',
	icon: IconTrash,
	isDangerous: true,
	onClick: async (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		const { fitView } = useSvelteFlow

		const is_confirmed = await confirmStore.show({
			title: 'Really delete?',
			message: 'Please confirm that you want to delete this node'
		})

		if (is_confirmed) {
			const response = await fetch(`/api/nodes/${node.id}`, { method: 'DELETE' })

			if (!response.ok) {
				console.error(response.statusText)
				toast.error('Failed to delete node')
				return
			}

			// Deletion confirmed and API request was OK - go ahead and delete from canvas

			// Update the node to indicate that it's being deleted, and then actually delete it after a delay
			setNodeProps(node.id, { deleted: true })
			removeNode(node.id)
			// TODO Probably a better idea to center to the node before the deleted one
			fitView({
				maxZoom: 1,
				duration: 500
			})
		}
	}
}

// Populate map
actionsMapStore.set('endpoint-node', [addAction])
actionsMapStore.set('action-node', [
	{
		label: 'Edit',
		icon: IconEditor,
		isDangerous: false,
		onClick: (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
			if (!node) return
			openWindow({
				id: `code-editor-action-${node.id}`,
				component: CodeEditorWindow,
				posX: 20,
				posY: 20,
				customProps: {
					files: {
						'action.py': node.data.spec.spec.source,
						'README.md': node.data.spec.spec.readme,
						'requirements.txt': node.data.spec.spec.deps
					},
					node
				}
			})
		}
	},
	addAction,
	deleteNode
])
