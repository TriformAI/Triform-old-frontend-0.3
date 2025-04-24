<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import FlowNode from '$lib/components/custom-nodes/FlowNode.svelte'
	import OpenFlowNode from '$lib/components/custom-nodes/OpenFlowNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'

	import {
		edges,
		edgesStore,
		nodes,
		nodesStore,
		registerUpdateNodeListener
	} from '$lib/stores/canvas.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { deleteNode as deleteNodeAction } from '$lib/stores/nodeActions.svelte'
	import { type Node, type NodeType, type TemporaryNode } from '$lib/types/flow'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		useSvelteFlow as svelteFlowHook,
		useUpdateNodeInternals
	} from '@xyflow/svelte'
	import '@xyflow/svelte/dist/style.css'
	import { onMount, type Component } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '../../utils/debounce'
	import { handleConnectEnd } from './FlowEvents/connectEnd.svelte'
	import { isValidConnection } from './FlowEvents/isValidConnection'
	import { getLayoutedNodes } from './layout.svelte'

	const useSvelteFlow = svelteFlowHook()
	const { fitView } = useSvelteFlow

	export { fitView }

	const { onClick: deleteNode } = deleteNodeAction

	const nodeTypes: Record<NodeType, Component> = {
		'endpoint-node': EndpointNode,
		'action-node': ActionNode,
		'flow-node': FlowNode,
		// @ts-expect-error TODO: adjust props on component
		'open-flow-node': OpenFlowNode,
		// @ts-expect-error TODO: adjust props on component
		'selector-node': SelectorNode
	}

	const updateNodeInternals = useUpdateNodeInternals()

	let projectIsLoaded = $state(false)

	// Whenever the nodes store changes, auto layout everything
	// Also used for updating the writable store that svelte flow requires
	$effect(() => {
		// reactivity
		if (nodes) {
			layoutNodes()
		}
	})

	onMount(() => {
		return registerUpdateNodeListener(updateNodeInternals)
	})

	const layoutNodes = async () => {
		const currentEdges = $state.snapshot(edges)
		const layoutedNodes = await getLayoutedNodes(Object.values(nodes), currentEdges)
		nodesStore.set(layoutedNodes)
		edgesStore.set(currentEdges)
		// console.log('new nodes', layoutedNodes)

		// TODO: smartly update only the modified noes
		updateNodeInternals(Object.keys(nodes))
		if (!projectIsLoaded) projectIsLoaded = true
	}

	const flowIsEmpty = $derived(!Object.keys(nodes).length)

	function addFirstNode() {
		// const triggerNode = {
		// 	component_id: crypto.randomUUID(),
		// 	component_version: 1,
		// 	spec: {
		// 		resource: 'endpoint/v1',
		// 		meta: {
		// 			name: 'Endpoint',
		// 			id: crypto.randomUUID(),
		// 			version: 1
		// 		},
		// 		spec: {
		// 			method: 'GET',
		// 			path: '/'
		// 		}
		// 	}
		// }
		// addNode('root', triggerNode)
	}

	const handleBeforeDelete = async ({ nodes }: { nodes: (Node | TemporaryNode)[] }) => {
		const allNodes = Object.values(nodes)
		const numNodes = allNodes.length
		const isMultipleNodes = numNodes > 1

		// Always allow deleting of selector nodes
		if (allNodes.some(node => node.type === 'selector-node')) {
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

	const handleDelete = async ({ nodes }: { nodes: Node[] }) => {
		for (const node of nodes) {
			await deleteNode(node, useSvelteFlow, false)
		}
	}
</script>

<svelte:window
	onresize={debounce(() => {
		// TODO improve this by calling setCenter instead if there is a selected node
		fitView({
			maxZoom: 1,
			duration: 500
		})
	}, 400)}
/>

<div class="relative grid h-full w-full" role="application">
	{#if projectIsLoaded}
		{#if flowIsEmpty}
			<div class="-mt-32 grid place-items-center gap-10 self-center">
				<p class="opacity-50">Get started by adding your first component</p>
				<button
					onclick={addFirstNode}
					type="button"
					class="bg-main-300 text-main-800 grid size-20 place-content-center rounded-full text-4xl leading-none transition-transform duration-300 ease-(--easing-circ) hover:scale-125"
				>
					+
				</button>
			</div>
		{:else}
			<SvelteFlow
				nodes={nodesStore}
				edges={edgesStore}
				{nodeTypes}
				isValidConnection={(...args) => isValidConnection(...args, useSvelteFlow)}
				fitView
				fitViewOptions={{
					maxZoom: 1,
					minZoom: 1
				}}
				onconnectend={(...args) => handleConnectEnd(...args, useSvelteFlow)}
				snapGrid={[1, 1]}
				proOptions={{ hideAttribution: true }}
				defaultEdgeOptions={{}}
				zoomOnDoubleClick={false}
				onbeforedelete={handleBeforeDelete}
				ondelete={handleDelete}
			>
				<Background
					bgColor="#18181b"
					patternColor="#52525c"
					gap={20}
					size={1}
					variant={BackgroundVariant.Dots}
				/>
			</SvelteFlow>
		{/if}
	{/if}
</div>
