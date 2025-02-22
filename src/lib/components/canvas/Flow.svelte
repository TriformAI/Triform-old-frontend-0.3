<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import OpenAgentNode from '$lib/components/custom-nodes/OpenAgentNode.svelte'
	import {
		addDownstreamNode,
		edges,
		nodes,
		removeNode,
		currentCanvas,
		setNodeProps
	} from '$lib/stores/canvas.svelte'
	import type { Uuid } from '$lib/types/agent'
	import type { Node } from '$lib/types/flow'
	import type { NodeTypes } from '@xyflow/svelte'
	import ContextMenu from './ContextMenu.svelte'
	import { onMount, untrack } from 'svelte'
	import { Background, BackgroundVariant, SvelteFlow, useUpdateNodeInternals } from '@xyflow/svelte'
	import { menuIsOpen, toggleContextMenu } from '$lib/stores/contextMenu.svelte'
	import { parseProject } from '$lib/stores/canvas.svelte'
	import '@xyflow/svelte/dist/style.css'
	import { getLayoutedNodes } from './layout.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '../../utils/debounce'
	import { useSvelteFlow } from '@xyflow/svelte'

	const { fitView } = useSvelteFlow()

	const nodeTypes: NodeTypes = {
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'endpoint-node': EndpointNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'action-node': ActionNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'agent-node': AgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'open-agent-node': OpenAgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'api-node': ApiNode
	}

	const updateNodeInternals = useUpdateNodeInternals()

	let projectIsParsed = $state(false)

	$effect(() => {
		const canvas = currentCanvas
		if (!canvas.project) return

		console.time('parse agent')
		let { nodes: nodesData, edges: edgesData } = parseProject(canvas.project)
		console.timeEnd('parse agent')

		console.log('edges', edgesData)
		untrack(async () => {
			nodesData = nodesData.map(node => {
				switch (node.type) {
					case 'action-node':
						node.data.files = undefined
						break
					case 'agent-node':
						node.data.onOpen = () => setNodeProps(node.id as Uuid, { expanded: true })
						break
					case 'open-agent-node':
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

	let contextMenuProps: {
		node?: Node
		top: number
		left: number
		right: number
		bottom: number
	} = $state({
		node: undefined,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	})

	let wrapper: HTMLElement

	onMount(() => {
		wrapper
			.querySelectorAll('.draggable')
			.forEach(el =>
				el.addEventListener('mousedown', () => toggleContextMenu(false), { capture: true })
			)
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

		addDownstreamNode('root', triggerNode)
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
				snapGrid={[1, 1]}
				proOptions={{ hideAttribution: true }}
				defaultEdgeOptions={{}}
				zoomOnDoubleClick={false}
				onbeforedelete={async e => {
					if (e.nodes.find(node => node.type === 'endpoint-node')) {
						toast.error("You can't delete an endpoint node.")
						return false
					}

					return true
				}}
				ondelete={e => {
					e.nodes.forEach(node => {
						removeNode(node.id)
					})
				}}
			>
				{#if menuIsOpen()}
					<ContextMenu {...contextMenuProps} />
				{/if}
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
