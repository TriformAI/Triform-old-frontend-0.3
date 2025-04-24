import type { Node, NodeType } from '$lib/types/flow'
import type { Component } from 'svelte'
import type { Uuid, Node as TriNode, Flow } from '$lib/types/agent'

import { dev } from '$app/environment'
import { SvelteMap } from 'svelte/reactivity'
import { useSvelteFlow as useSvelteFlowHook, type Edge } from '@xyflow/svelte'
import {
	addChild,
	collapseFlow,
	expandFlow,
	removeChild,
	project,
	nodes,
	updateNode
} from './canvas.svelte'
import { confirmStore } from './confirm.svelte'
import { toast } from 'svelte-sonner'
import { publishComponent, createComponent } from '$lib/actions/components'
import { saveProject } from '$lib/actions/project'
import IconTrash from '~icons/material-symbols/delete-outline'
import IconAdd from '~icons/material-symbols/add-diamond-outline'
import IconExpand from '~icons/mdi/circle-expand'
import IconNetworkNode from '~icons/material-symbols/network-node'
import IconClose from '~icons/material-symbols/close-fullscreen-rounded'
import IconBug from '~icons/material-symbols/bug-report-outline-rounded'
import { addNodeSelector } from '$lib/utils/addNodeSelector'

export type onClickFn = (
	node: Node,
	useSvelteFlow: ReturnType<typeof useSvelteFlowHook>
) => Promise<Uuid | void> | void
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
	onClick: async (
		node: Node,
		useSvelteFlow: ReturnType<typeof useSvelteFlowHook>,
		addAsChild: boolean = false,
		inputs?: Uuid[]
	) => {
		const newActionNode = {
			component_id: crypto.randomUUID(), // so it validates
			component_version: null,
			inputs: inputs ?? [addAsChild ? 'parent' : node.id],
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
		const newActionComponent = await createComponent(newActionNode.spec)
		newActionNode.component_id = newActionComponent.meta.id
		newActionNode.spec = newActionComponent
		const parentId = (addAsChild ? node.id : node.parentId) as Uuid
		const newNodeId = crypto.randomUUID()
		addChild(parentId, newActionNode, newNodeId)
		// Save parent
		const parent = nodes[parentId]
		if (parent) {
			try {
				await publishComponent(parent.data.trinode.spec)
			} catch (e) {
				console.error('Failed to publish parent component', e)
				toast.error('Failed to publish parent component')
				removeChild(newNodeId)
			}
		} else {
			try {
				const currentProject = project()
				if (!currentProject) throw new Error('No project found')
				await saveProject(currentProject)
			} catch (e) {
				console.error('Failed to save project', e)
				toast.error('Failed to save project')
				removeChild(newNodeId)
			}
		}

		const {
			getNodes
			// getZoom,
			// setCenter
		} = useSvelteFlow
		setTimeout(() => {
			const nodes = getNodes()
			const pos = nodes[nodes.length - 1].position
			if (!pos) return
			// const currentZoom = getZoom()
			// setCenter(pos.x + 40, pos.y + 100, { zoom: currentZoom, duration: 500 })
		}, 100)

		return newNodeId
	}
}

export const addFlow = {
	label: 'Create Flow',
	icon: IconNetworkNode,
	isDangerous: false,
	onClick: async (
		node: Node,
		useSvelteFlow: ReturnType<typeof useSvelteFlowHook>,
		addAsChild: boolean = false,
		inputs?: Uuid[]
	) => {
		const {
			getNodes
			// getZoom,
			// setCenter
		} = useSvelteFlow

		const flowNodeId = crypto.randomUUID()
		const newFlowNode = {
			component_id: crypto.randomUUID(), // so it validates
			component_version: null,
			inputs: inputs ?? [addAsChild ? 'parent' : node.id],
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
		// Create components
		// TODO: do this in addNode maybe so the nodes can appear on the canvas quicker
		// and show some sort of loading state
		const publishedFlow = await createComponent(newFlowNode.spec)
		newFlowNode.component_id = publishedFlow.meta.id
		newFlowNode.spec = publishedFlow as Flow
		// Add the final flow to the parent flow (or root project)
		const parentId = (addAsChild ? node.id : node.parentId) as Uuid
		addChild(parentId, newFlowNode, flowNodeId)

		// expand the new flow
		expandFlow(flowNodeId)

		// Show node selector once everything has been created
		// We can defer this and publish the parent in the background,
		// so no need to await it
		setTimeout(() => {
			const nodeSelectorId = crypto.randomUUID()
			const selectorEdge = {
				source: flowNodeId,
				sourceHandle: `${flowNodeId}:input`,
				target: nodeSelectorId
			} as Edge
			const flowNode = nodes[flowNodeId]

			const position = {
				x: flowNode.position.x + (flowNode.measured?.width ?? 0) / 2,
				y: flowNode.position.y + (flowNode.measured?.height ?? 0) / 6
			}

			addNodeSelector(
				selectorEdge,
				position,
				nodeSelectorId,
				true,
				// Make sure the node selector is bounded within the same context as the new flow
				// so the position matches
				// Alternatively we could calculate the position manually, but I think this might be good for now
				flowNode.parentId
			)
		}, 100)

		// Save parent
		const parent = nodes[parentId]
		if (parent) {
			try {
				await publishComponent(parent.data.trinode.spec)
			} catch (e) {
				console.error('Failed to publish parent component', e)
				toast.error('Failed to publish parent component')
				removeChild(flowNodeId)
				// might be good to delete the flow component here too
			}
		} else {
			try {
				const currentProject = project()
				if (!currentProject) throw new Error('No project found')
				await saveProject(currentProject)
			} catch (e) {
				console.error('Failed to save project', e)
				toast.error('Failed to save project')
				removeChild(flowNodeId)
				// might be good to delete the flow component here too
			}
		}

		setTimeout(() => {
			const nodes = getNodes()
			const pos = nodes[nodes.length - 1].position
			if (!pos) return
			// const currentZoom = getZoom()
			// setCenter(pos.x + 40, pos.y + 100, { zoom: currentZoom, duration: 500 })
		}, 100)

		return flowNodeId
	}
}

export const deleteNode = {
	label: 'Remove',
	icon: IconTrash,
	isDangerous: true,
	onClick: async (
		node: Node,
		useSvelteFlow: ReturnType<typeof useSvelteFlowHook>,
		showConfirmation: boolean = true
	) => {
		if (showConfirmation) {
			const isConfirmed = await confirmStore.show({
				title: 'Are you sure?',
				message: 'Please confirm that you want to delete this node'
			})
			if (!isConfirmed) {
				return
			}
		}

		// const { fitView } = useSvelteFlow
		// Update the node to indicate that it's being deleted, and then actually delete it after a delay
		node.data.props.deleted = true
		setTimeout(async () => {
			const previousNodes = removeChild(node.id)

			const revert = () => {
				addChild(parent.id, node.data.trinode, node.id)
				for (const [id, previous] of previousNodes) {
					updateNode(id, previous)
				}
			}

			const parent = structuredClone($state.snapshot(nodes[node.parentId as Uuid]))
			if (parent) {
				try {
					await publishComponent(parent.data.trinode.spec)
				} catch (e) {
					console.error('Failed to publish parent component', e)
					toast.error('Failed to publish parent component')
					revert()
				}
			} else {
				try {
					const currentProject = project()
					if (!currentProject) throw new Error('No project found')
					await saveProject(currentProject)
				} catch (e) {
					console.error('Failed to save project', e)
					toast.error('Failed to save project')
					revert()
				}
			}

			// fitView({
			// 	maxZoom: 1,
			// 	duration: 500
			// })
		}, 150)
	}
}

// Populate map
actionsMapStore.set('endpoint-node', [addFlow, getDebugData])
actionsMapStore.set('action-node', [addAction, addFlow, getDebugData, deleteNode])
actionsMapStore.set('flow-node', [
	{
		label: 'Expand',
		icon: IconExpand,
		isDangerous: false,
		onClick: (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
			if (!node) return
			expandFlow(node.id)
		}
	},
	addAction,
	addFlow,
	getDebugData,
	deleteNode
])
actionsMapStore.set('open-flow-node', [
	{
		label: 'Close',
		id: 'close',
		icon: IconClose,
		isDangerous: false,
		onClick: (node: Node, _useSvelteFlow: ReturnType<typeof useSvelteFlowHook>) => {
			if (!node) return
			collapseFlow(node.id)
		}
	},
	getDebugData,
	deleteNode
])
