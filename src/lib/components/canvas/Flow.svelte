<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import FlowNode from '$lib/components/custom-nodes/FlowNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import OpenFlowNode from '$lib/components/custom-nodes/OpenFlowNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'

	import { deleteNode as deleteNodeAction } from '$lib/stores/nodeActions.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { addNode, edges, nodes, currentCanvas } from '$lib/stores/canvas.svelte'
	import type { Uuid } from '$lib/types/agent'
	import { untrack } from 'svelte'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		useUpdateNodeInternals,
		useSvelteFlow as svelteFlowHook,
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
	import { get } from 'svelte/store'
	import { handleConnectEnd } from './FlowEvents/connectEnd'
	import { isValidConnection } from './FlowEvents/isValidConnection'

	const useSvelteFlow = svelteFlowHook()
	const { fitView, getNode } = useSvelteFlow

	export { fitView }

	const { onClick: deleteNode } = deleteNodeAction

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

	const handleConnectStart: OnConnectStart = (_event, connectionState) => {
		const nodeId = connectionState.nodeId as Uuid
		const node = getNode(nodeId)
		if (!node || !node.parentId) return

		const flow = getNode(node.parentId)
		if (!flow) return

		// If the origin node is the furthest down of all sibling nodes, grow the flow a bit
		const maxYPos = Math.max(
			...get(nodes)
				.filter(n => n.parentId === flow.id)
				.map(n => n.position.y)
		)
		// Add a bit of leeway in case of rounding errors and other stuff
		const offset = 10
		if (node.position.y + offset < maxYPos) return

		const additionalHeight = 80
		flow.height = (flow.measured?.height ?? 0) + additionalHeight
		flow.data.extended = { height: additionalHeight }
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
				class="rounded"
				{nodes}
				{edges}
				{nodeTypes}
				isValidConnection={(...args) => isValidConnection(...args, useSvelteFlow)}
				fitView
				fitViewOptions={{
					maxZoom: 1,
					minZoom: 1
				}}
				onconnectstart={handleConnectStart}
				onconnectend={(...args) => handleConnectEnd(...args, useSvelteFlow)}
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
