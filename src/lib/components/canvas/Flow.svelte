<script lang="ts">
	import type { Canvas, OpenAgents } from '$lib/stores/canvas.svelte'
	import type { Node, Edge, NodeTypes, EdgeTypes } from '@xyflow/svelte'

	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import OpenAgentNode from '$lib/components/custom-nodes/OpenAgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import FloatingEdge from './FloatingEdge.svelte'
	import ContextMenu from './ContextMenu.svelte'

	import { writable } from 'svelte/store'
	import { onMount, untrack } from 'svelte'
	import { SvelteFlow, Background, BackgroundVariant, useUpdateNodeInternals } from '@xyflow/svelte'

	import { menuIsOpen, toggleMenu } from '$lib/stores/contextMenu.svelte'

	import '@xyflow/svelte/dist/style.css'
	import { parseAgent } from '$lib/stores/canvas.svelte'
	import { getLayoutedNodes } from './layout.svelte'

	const nodeTypes: NodeTypes = {
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'action-node': ActionNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'agent-node': AgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'open-agent-node': OpenAgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'api-node': ApiNode
	}
	const edgeTypes: EdgeTypes = {
		// @ts-expect-error type issue, not crucial but should probs be fixed
		floating: FloatingEdge
	}

	const nodes = writable<Node[]>([])
	const edges = writable<Edge[]>([])

	const { canvas, openAgents }: { canvas: Canvas; openAgents: OpenAgents } = $props()

	const updateNodeInternals = useUpdateNodeInternals()

	$effect(() => {
		if (!canvas) return

		console.time('parse agent')
		let { nodes: nodesData, edges: edgesData } = parseAgent(canvas.resource)
		console.timeEnd('parse agent')

		console.log('edges', edgesData)

		// Used to get effect to trigger on canvas.resource change
		const ref = canvas.resource
		untrack(async () => {
			nodesData = nodesData.map(node => {
				if (node.type === 'action-node') {
					node.data.files = undefined
				} else if (node.type === 'agent-node') {
					node.data.onOpen = () => (openAgents[node.id] = true)
				} else if (node.type === 'open-agent-node') {
					node.data.onOpen = () => (openAgents[node.id] = false)
					node.width = 400
					node.height = 400
				} else throw new Error('unknown node type ' + node.type)
				return node
			})

			console.time('layout')
			const layoutedNodes = await getLayoutedNodes(nodesData, edgesData)
			console.timeEnd('layout')

			nodes.set(layoutedNodes)
			edges.set(edgesData)

			// TODO: smartly update only the modified nodes
			updateNodeInternals(nodesData.map(n => n.id))
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
			.forEach(el => el.addEventListener('mousedown', () => toggleMenu(false), { capture: true }))
	})

	const openContextMenu = (args: CustomEvent) => {
		const {
			detail: { event, node }
		}: {
			detail: {
				event: MouseEvent
				node: Node
			}
		} = args

		event.preventDefault()

		contextMenuProps = {
			node,
			// TODO: use the width/height of wrapper to make sure it doesn't get placed off screen
			top: event.clientY - wrapper.offsetTop,
			left: event.clientX - wrapper.offsetLeft,
			right: event.clientX,
			bottom: event.clientY
		}
		toggleMenu(true)
	}
</script>

<div class="relative w-full h-full" bind:this={wrapper}>
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		{edgeTypes}
		fitView
		snapGrid={[1, 1]}
		proOptions={{ hideAttribution: true }}
		defaultEdgeOptions={{}}
		on:nodecontextmenu={openContextMenu}
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
</div>
