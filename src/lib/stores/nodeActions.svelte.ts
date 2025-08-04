import { dev } from '$app/environment'
import { goto } from '$app/navigation'
import { page } from '$app/state'
import type { UUID as Uuid } from 'crypto'
import { type Node, type NodeType } from '$lib/types/canvas'
import type { Component } from 'svelte'
import { toast } from 'svelte-sonner'
import { SvelteMap } from 'svelte/reactivity'
import IconBug from '~icons/material-symbols/bug-report-outline-rounded'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconExpand from '~icons/mdi/circle-expand'
import { confirmStore } from './confirm.svelte'
import { deleteNode as deleteNodeFn } from './canvas.svelte'

export type onClickFn = (node: Component) => Promise<Uuid | void> | void

interface ActionItem {
	// For when we access the items programmatically
	id?: string
	label: string
	hide?: () => boolean
	icon: Component
	isDangerous: boolean
	onClick: onClickFn
}

const actionsMapStore = $state(new SvelteMap<NodeType, ActionItem[]>())
export const actionsMap = () => actionsMapStore
export const getActions = (nodeType: NodeType) =>
	actionsMap()
		.get(nodeType)
		?.filter(a => !a.hide?.()) ?? []

/*
  Generic functions used by multiple nodes
*/
const getDebugData = {
	label: 'Debug',
	icon: IconBug,
	isDangerous: false,
	hide: () => !dev,
	onClick: async (node: Node) => {
		console.log('Debug', $state.snapshot(node))
		toast.info('Printed debug data to console')
	}
}

export const deleteNode = {
	label: 'Remove',
	icon: IconTrash,
	isDangerous: true,
	onClick: async (node: Node, showConfirmation: boolean = true) => {
		if (showConfirmation) {
			const isConfirmed = await confirmStore.show({
				title: 'Are you sure?',
				message: 'Please confirm that you want to delete this node'
			})
			if (!isConfirmed) {
				return
			}
		}

		await deleteNodeFn(node.id)
	}
}

// Populate map
actionsMapStore.set('action-node', [getDebugData, deleteNode])
actionsMapStore.set('flow-node', [
	{
		label: 'Expand',
		icon: IconExpand,
		isDangerous: false,
		onClick: async (node: Node) => {
			if (!node) return
			await goto(page.url.pathname + '/' + node.id)
		}
	},

	getDebugData,
	deleteNode
])
