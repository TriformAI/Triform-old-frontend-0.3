import { dev } from '$app/environment'
import { goto } from '$app/navigation'
import { page } from '$app/state'
import { type UUID as Uuid } from 'crypto'
import { type CanvasNode, type MetaNodeType, type NodeType } from '$lib/types/canvas'
import type { Component } from 'svelte'
import { toast } from 'svelte-sonner'
import { SvelteMap } from 'svelte/reactivity'
import IconBug from '~icons/material-symbols/bug-report-outline-rounded'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconExpand from '~icons/mdi/circle-expand'
import IconLoop from '~icons/material-symbols/sync-rounded'
import IconBuild from '~icons/material-symbols/tools-wrench-outline-rounded'
import { confirmStore } from './confirm.svelte'
import { deleteNode as deleteNodeFn, getCurrentContainer, saveContainer, setLoop } from './canvas.svelte'
import { chat, getUserMessage } from './chat.svelte'
import { type Node } from '$lib/types/canvas'
import { clone } from '$lib/utils/clone'
import { isAgent, isFlow } from '$lib/schemas'

export type onClickFn = (node: CanvasNode) => Promise<Uuid | void> | void

interface ActionItem {
	// For when we access the items programmatically
	id?: string
	label: string
	hide?: () => boolean
	icon: Component
	isDangerous: boolean
	onClick: onClickFn
}

const actionsMapStore = $state(new SvelteMap<NodeType | MetaNodeType, ActionItem[]>())
export const actionsMap = () => actionsMapStore
export const getActions = (nodeType: NodeType | MetaNodeType) =>
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
	onClick: async (node: CanvasNode) => {
		console.log('Debug', $state.snapshot(node))
		toast.info('Printed debug data to console')
	}
}

export const deleteNode = {
	label: 'Remove',
	icon: IconTrash,
	isDangerous: true,
	onClick: async (node: CanvasNode, showConfirmation: boolean = true) => {
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

export const expandNode = {
	label: 'Expand',
	icon: IconExpand,
	isDangerous: false,
	onClick: async (node: CanvasNode) => {
		if (!node) return
		if (node.type !== 'agent-node' && node.type !== 'flow-node') return
		await goto(page.url.pathname + '/' + node.id)
	}
}

const buildNode = {
	label: 'Build',
	icon: IconBuild,
	isDangerous: false,
	hide: () => !dev,
	onClick: async (node: CanvasNode) => {
		node = node as Node
		const msg = getUserMessage()
		const resource = node.data.trinode.spec.resource.split('/')[1]
		msg.data.content[0].text = `build ${resource}`
		msg.data.context = {
			[`@${node.data.trinode.spec.meta.name}`]: {
				component_id: node.data.trinode.component_id
			}
		}
		if (!chat.socket) {
			toast.error(`Could not start building ${resource}`)
			return
		}
		chat.socket.send(JSON.stringify(msg))
	}
}

const loopNode = {
	label: 'Toggle looping',
	icon: IconLoop,
	isDangerous: false,
	hide: () => !isFlow(getCurrentContainer()),
	onClick: async (node: CanvasNode) => await setLoop(node.id, !node.data.trinode?.loop?.enabled)
}

// Populate map
actionsMapStore.set('action-node', [getDebugData, loopNode, buildNode, deleteNode])
actionsMapStore.set('flow-node', [expandNode, loopNode, getDebugData, buildNode, deleteNode])
actionsMapStore.set('agent-node', [expandNode, loopNode, getDebugData, buildNode, deleteNode])
