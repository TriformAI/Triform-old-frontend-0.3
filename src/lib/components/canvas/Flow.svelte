<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import FlowNode from '$lib/components/custom-nodes/FlowNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import OpenFlowNode from '$lib/components/custom-nodes/OpenFlowNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'
	import { deleteNode as deleteNodeAction } from '$lib/stores/nodeActions.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'

	const { onClick: deleteNode } = deleteNodeAction

	import {
		addNode,
		edges,
		nodes,
		removeNode,
		currentCanvas,
		setNodeProps
	} from '$lib/stores/canvas.svelte'
	import type { Uuid } from '$lib/types/agent'

	import { untrack } from 'svelte'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		useUpdateNodeInternals,
		type OnConnectEnd,
		type OnConnectStart,
		type Node,
		type NodeTypes
	} from '@xyflow/svelte'
	import { parseProject } from '$lib/stores/canvas.svelte'
	import '@xyflow/svelte/dist/style.css'
	import { getLayoutedNodes } from './layout.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '../../utils/debounce'
	import { useSvelteFlow } from '@xyflow/svelte'

	const { fitView, screenToFlowPosition, getNode } = useSvelteFlow()

	const nodeTypes: NodeTypes = {
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'endpoint-node': EndpointNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'action-node': ActionNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'flow-node': FlowNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'open-flow-node': OpenFlowNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'api-node': ApiNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'selector-node': SelectorNode
	}

	const updateNodeInternals = useUpdateNodeInternals()

	let projectIsParsed = $state(false)

	$effect(() => {
		const canvas = currentCanvas
		if (!canvas.project) return

		console.time('parse project')
		let { nodes: nodesData, edges: edgesData } = parseProject(canvas.project)
		console.timeEnd('parse project')

		untrack(async () => {
			nodesData = nodesData.map(node => {
				switch (node.type) {
					case 'action-node':
						node.data.files = undefined
						break
					case 'flow-node':
						node.data.onOpen = () => setNodeProps(node.id as Uuid, { expanded: true })
						break
					case 'open-flow-node':
						node.data.onOpen = () => setNodeProps(node.id as Uuid, { expanded: false })
						node.width = 400
						node.height = 400
						break
					case 'endpoint-node':
						break
					default:
						throw new Error('unknown node type ' + node.type)
				}
				return node
			})

			console.time('layout')
			const layoutedNodes = await getLayoutedNodes(nodesData, edgesData)
			console.timeEnd('layout')

			nodes.set(layoutedNodes)
			edges.set(edgesData)

			// TODO: smartly update only the modified nodes
			updateNodeInternals(nodesData.map(n => n.id))

			projectIsParsed = true
		})
	})

	let wrapper: HTMLElement

	// For when we add a context menu, there's some trickery to be done:
	// onMount(() => {
	// 	wrapper
	// 		.querySelectorAll('.draggable')
	// 		.forEach(el =>
	// 			el.addEventListener('mousedown', () => toggleContextMenu(false), { capture: true })
	// 		)
	// })

	const flowIsEmpty = $derived($nodes.length === 0)

	function addFirstNode() {
		const triggerNode = {
			component_id: crypto.randomUUID(),
			component_version: 1,
			spec: {
				resource: 'endpoint/v1',
				meta: {
					name: 'Endpoint',
					id: crypto.randomUUID(),
					version: 1
				},
				spec: {
					method: 'GET',
					path: '/'
				}
			}
		}

		addNode('root', triggerNode)
	}

	const handleConnectEnd: OnConnectEnd = (event, connectionState) => {
		const { fromNode } = connectionState
		if (!fromNode) return

		// Don't trigger the selector for valid conenctions, or
		// if the origin of the new edge is at the top of a node
		if (connectionState.isValid || connectionState.fromHandle?.type === 'target') {
			if (!fromNode.parentId) return
			const flow = getNode(fromNode.parentId)
			if (!flow) return
			flow.height = (flow.measured?.height ?? 0) - 80
			updateNodeInternals(flow.id)
			return
		}

		const sourceNodeId = fromNode.id as Uuid

		const id = crypto.randomUUID()
		const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event

		const newNode: Node = {
			id,
			type: 'selector-node',
			data: { sourceNodeId },
			// project the screen coordinates to pane coordinates
			position: screenToFlowPosition({
				x: clientX,
				y: clientY
			}),
			// set the origin of the new node so it is centered
			origin: [0.5, 0.0]
		}

		$nodes.push(newNode)
		$edges.push({
			source: sourceNodeId,
			target: id,
			id: `${sourceNodeId}:${id}`
		})

		$nodes = $nodes
		$edges = $edges
	}

	import { get } from 'svelte/store'
	const handleConnectStart: OnConnectStart = (event, connectionState) => {
		console.log('edges', JSON.stringify(get(edges), null, 2))
		const nodeId = connectionState.nodeId as Uuid
		const node = getNode(nodeId)
		if (!node || !node.parentId) return

		const flow = getNode(node.parentId)
		if (!flow) return
		flow.height = (flow.measured?.height ?? 0) + 80
		updateNodeInternals(flow.id)
	}

	const handleBeforeDelete = async ({ nodes }: { nodes: Node[] }) => {
		const numNodes = nodes.length
		const isMultipleNodes = numNodes > 1

		// Always allow deleting of selector nodes
		if (nodes.some(node => node.type === 'selector-node')) {
			return true
		}

		// Don't allow deleting of endpoint nodes
		if (nodes.find(node => node.type === 'endpoint-node')) {
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

	const useSvelteFlowObj = useSvelteFlow()

	const handleDelete = async ({ nodes }: { nodes: Node[] }) => {
		for (const node of nodes) {
			await deleteNode(node, useSvelteFlowObj, false)
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

<div class="relative grid h-full w-full" bind:this={wrapper} role="application">
	{#if projectIsParsed}
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
				{nodes}
				{edges}
				{nodeTypes}
				fitView
				fitViewOptions={{
					maxZoom: 1,
					minZoom: 1
				}}
				onconnectstart={handleConnectStart}
				onconnectend={handleConnectEnd}
				snapGrid={[1, 1]}
				proOptions={{ hideAttribution: true }}
				defaultEdgeOptions={{}}
				zoomOnDoubleClick={false}
				onbeforedelete={handleBeforeDelete}
				ondelete={handleDelete}
			>
				<Background
					bgColor="#181819"
					patternColor="#1D1E20"
					gap={20}
					size={1}
					variant={BackgroundVariant.Lines}
				/>
			</SvelteFlow>
		{/if}
	{/if}
</div>
