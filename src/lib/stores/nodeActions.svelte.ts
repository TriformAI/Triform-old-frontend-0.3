import type { Node, NodeType } from '$lib/types/flow'
import type { Component } from 'svelte'
import type { Uuid, Node as TriNode, Action, Flow } from '$lib/types/agent'

import { dev } from '$app/environment'
import { SvelteMap } from 'svelte/reactivity'
import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
import { openWindow } from './windows.svelte'
import { removeNode, addNode, setNodeProps, saveProject } from './canvas.svelte'
import { confirmStore } from './confirm.svelte'
import { toast } from 'svelte-sonner'
import { API } from '$lib/api'
const api = new API()

import CodeEditorWindow from '$lib/components/windows/CodeEditorWindow.svelte'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconAdd from '~icons/material-symbols/add-diamond-outline'
import IconEditor from '~icons/material-symbols/code-blocks-outline'
import IconExpand from '~icons/mdi/circle-expand'
import IconNetworkNode from '~icons/material-symbols/network-node'
import IconClose from '~icons/material-symbols/close-fullscreen-rounded'
import IconBug from '~icons/material-symbols/bug-report-outline-rounded'

export type onClickFn = (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => void
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
	onClick: async (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		console.log('Debug', $state.snapshot(node))
		toast.info('Printed debug data to console')
	}
}

export const addAction = {
	label: 'Create Action',
	icon: IconAdd,
	isDangerous: false,
	onClick: async (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		const newActionNode = {
			component_id: crypto.randomUUID(), // so it validates
			component_version: null,
			inputs: [node.id],
			spec: {
				resource: 'action/v1',
				meta: {
					name: 'Action',
					id: crypto.randomUUID(),
					version: 1
				},
				spec: {
					source: '@triform.entrypoint\ndef action(input):\n  return input',
					readme: '',
					deps: '',
					streaming: false
				}
			}
		} as TriNode
		const newActionComponent = await api.post<Action>('components', newActionNode.spec)
		newActionNode.component_id = newActionComponent.meta.id
		newActionNode.spec = newActionComponent
		await addNode(node.parentId as Uuid, newActionNode, crypto.randomUUID())

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

export const addFlow = {
	label: 'Create Flow',
	icon: IconNetworkNode,
	isDangerous: false,
	onClick: async (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		const flowNodeId = crypto.randomUUID()
		const newFlowNode = {
			component_id: crypto.randomUUID(), // so it validates
			component_version: null,
			inputs: [node.id],
			spec: {
				resource: 'flow/v1',
				meta: {
					name: 'Flow',
					id: crypto.randomUUID(),
					version: 1
				},
				spec: {
					readme: 'Flow',
					nodes: {},
					outputs: []
				}
			}
		} as {
			spec: Flow
		} & TriNode
		// Add an action to the flow
		const newActionNode = {
			component_id: crypto.randomUUID(), // so it validates
			component_version: null,
			spec: {
				resource: 'action/v1',
				meta: {
					name: 'Action',
					id: crypto.randomUUID(),
					version: 1
				},
				spec: {
					source: '@triform.entrypoint\ndef action(input):\n  return input',
					readme: '',
					deps: '',
					streaming: false
				}
			}
		} as TriNode
		// Create components
		// TODO: do this in addnOde maybe so the nodes can appear on the canvas quicker
		// and show some sort of loading state
		const [publishedFlow, publishedAction] = await Promise.all([
			api.post<Flow>('components', newFlowNode.spec),
			api.post<Action>('components', newActionNode.spec)
		])
		newFlowNode.component_id = publishedFlow.meta.id
		newFlowNode.spec = publishedFlow
		newActionNode.component_id = publishedAction.meta.id
		newActionNode.spec = publishedAction
		// Add the final flow to the parent flow (or root project)
		await addNode(node.parentId as Uuid, newFlowNode, flowNodeId)
		// Add the new action to the flow
		await addNode(flowNodeId, newActionNode, crypto.randomUUID())

		setTimeout(() => {
			const { getNodes, getZoom, setCenter } = useSvelteFlow
			const nodes = getNodes()
			const pos = nodes[nodes.length - 1].position
			if (!pos) return
			const currentZoom = getZoom()
			setCenter(pos.x + 40, pos.y + 100, { zoom: currentZoom, duration: 500 })
		}, 100)
	}
}

const deleteNode = {
	label: 'Remove',
	icon: IconTrash,
	isDangerous: true,
	onClick: async (node: Node, useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
		const { fitView } = useSvelteFlow

		const isConfirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'Please confirm that you want to delete this node'
		})

		if (!isConfirmed) return

		// Update the node to indicate that it's being deleted, and then actually delete it after a delay
		setNodeProps(node.id, { deleted: true })
		setTimeout(async () => {
			await removeNode(node.id, node.parentId as Uuid)
			console.log('Deleted node, saving project automatically...')
			saveProject()
			fitView({
				maxZoom: 1,
				duration: 500
			})
		}, 150)
	}
}

// Populate map
actionsMapStore.set('endpoint-node', [addFlow, getDebugData])
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
					nodeId: node.id
				}
			})
		}
	},
	addAction,
	addFlow,
	deleteNode,
	getDebugData
])
actionsMapStore.set('flow-node', [
	{
		label: 'Expand',
		icon: IconExpand,
		isDangerous: false,
		onClick: (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
			if (!node) return
			setNodeProps(node.id, { expanded: true })
		}
	},
	addAction,
	addFlow,
	deleteNode,
	getDebugData
])
actionsMapStore.set('open-flow-node', [
	{
		label: 'Close',
		id: 'close',
		icon: IconClose,
		isDangerous: false,
		onClick: (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
			if (!node) return
			setNodeProps(node.id, { expanded: false })
		}
	},
	getDebugData
])
