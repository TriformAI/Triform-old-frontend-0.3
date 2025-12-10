import { dev } from '$app/environment'
import { goto } from '$app/navigation'
import { page } from '$app/state'
import { type UUID as Uuid } from 'crypto'
import { type CanvasNode, type MetaNodeType, type NodeType, type Node } from '$lib/types/canvas'
import type { Component } from 'svelte'
import { toast } from 'svelte-sonner'
import { SvelteMap } from 'svelte/reactivity'
import IconBug from '~icons/material-symbols/bug-report-outline-rounded'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconExpand from '~icons/mdi/circle-expand'
import IconLoop from '~icons/material-symbols/sync-rounded'
import IconBuild from '~icons/material-symbols/tools-wrench-outline-rounded'
import IconCopy from '~icons/material-symbols/content-copy-rounded'
import IconPaste from '~icons/material-symbols/content-paste-rounded'
import IconCreate from '~icons/material-symbols/add-box-rounded'
import { confirmStore } from './confirm.svelte'
import { addCreateNode, addNode, attachModifier, deleteNode as deleteNodeFn, getCurrentContainer, getCurrentNodePath, getModifiers, getProjectModifiers, saveContainer, setLoop } from './canvas.svelte'
import { chat, getUserMessage } from './chat.svelte'
import { clone } from '$lib/utils/clone'
import { isAgent, isFlow, resolvedComponentModel } from '$lib/schemas'
import { copyPayloadModel } from '$lib/schemas/copy'
import type z from 'zod'
import { sessionStore } from './session.svelte'
import { cloneComponent } from '$lib/actions/components'
import { objFilter } from '$lib/utils/objectFilter'
import { objectMap } from '$lib/utils/objectMap'
import { objKeyMap } from '$lib/utils/objKeyMap'

export type onClickFn = (node: CanvasNode) => Promise<Uuid | void> | void

interface ActionItem {
	// For when we access the items programmatically
	id?: string
	label: string
	hide?: () => boolean
	icon: typeof IconBug
	isDangerous: boolean
	onClick: onClickFn
}

export interface CanvasActionItem {
	label: string
	icon: typeof IconCreate
	isDangerous: boolean
	disabled?: () => Promise<boolean> | boolean
	onClick: (position: { x: number; y: number }) => Promise<void> | void
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

const copyNode = {
	label: 'Copy',
	icon: IconCopy,
	isDangerous: false,
	onClick: async (_node: CanvasNode) => {
		if (!_node.data.trinode) return void toast.error('Cannot copy this node')
		const node = _node as Node
		if (!sessionStore.session?.activeOrganizationId) return void toast.error('No active organization')

		// find all modifiers that concern this node and its children
		const basePath = [...getCurrentNodePath(), node.id !== 'container' && node.id].filter(Boolean).join('/')
		console.log('basePath', basePath)
		const allModifiers = objFilter(getProjectModifiers(), key => key.startsWith(basePath))
		// get rid of the base path to make them relative to the new node. if it's the root node just set it to 'root'
		const remappedModifiers = objKeyMap(allModifiers, key => key.replace(new RegExp(`^${basePath}/?`), '') || 'root')
		// unresolve all modifiers
		const modifiers = objectMap(remappedModifiers, value => value.map(({ spec: _spec, ...value }) => value))

		const payload = await copyPayloadModel.parseAsync({
			schema: 'tf-component-copy/v1',
			component_id: node.data.trinode.component_id,
			organization_id: sessionStore.session?.activeOrganizationId,
			modifiers
		} satisfies z.infer<typeof copyPayloadModel>)
		navigator.clipboard.writeText(JSON.stringify(payload))
		toast.success('Copied node to clipboard')
	}
}

// Populate map
actionsMapStore.set('action-node', [getDebugData, copyNode, loopNode, buildNode, deleteNode])
actionsMapStore.set('flow-node', [expandNode, getDebugData, copyNode, loopNode, buildNode, deleteNode])
actionsMapStore.set('agent-node', [expandNode, getDebugData, copyNode, loopNode, buildNode, deleteNode])


// generic canvas context menu (when you click on the canvas itself)
const createNode = {
	label: 'New Node',
	icon: IconCreate,
	isDangerous: false,
	onClick: async (position: { x: number; y: number }) => {
		addCreateNode(position, true, true)
	}
} satisfies CanvasActionItem

const parseClipboard = async () => {
	try {
		const clipboard = await navigator.clipboard.readText()
		// if it isn't even close to json, just exit immediately
		if (!clipboard.trim().startsWith('{') || !clipboard.trim().endsWith('}') || !clipboard.trim().includes(':')) return undefined
		return await copyPayloadModel.parseAsync(JSON.parse(clipboard))
	} catch (e) {
		console.error(e)
		return undefined
	}
}

const pasteNode = {
	label: 'Paste',
	icon: IconPaste,
	isDangerous: false,
	disabled: async () => await parseClipboard() === undefined,
	onClick: async (position) => {
		const payload = await parseClipboard()
		if (!payload) return void toast.error('Failed to paste node')

		const cloned = await cloneComponent(payload.component_id, 999)

		if (!cloned.success) return void toast.error('Failed to clone component')

		const clonedComponent = cloned.data as z.infer<typeof resolvedComponentModel>

		const newNode = await addNode(clonedComponent, position)

		// attach modifiers if needed
		if (!Object.keys(payload.modifiers ?? {}).length) return
		const currentPath = getCurrentNodePath()
		const allModifiers = getModifiers()
		for (const [path, modifiers] of Object.entries(payload.modifiers)) {
			const newPath = [...currentPath, newNode.id, ...path.split('/')]
			for (const {modifier_id} of modifiers) {
				const modifier = allModifiers[modifier_id]
				if (!modifier) {
					toast.error(`Modifier ${modifier_id} not found`)
					continue
				}
				await attachModifier(newPath, modifier)
			}
		}
	}
} satisfies CanvasActionItem

const canvasActionsStore = $derived([
	createNode,
	pasteNode
])

export const canvasActions = () => canvasActionsStore