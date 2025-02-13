<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import OpenAgentNode from '$lib/components/custom-nodes/OpenAgentNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'
	import { addDownstreamNode, edges, nodes, removeNode } from '$lib/stores/canvas.svelte'
	import type { Uuid } from '$lib/types/agent'
	import type { Node } from '$lib/types/flow'
	import type { NodeTypes } from '@xyflow/svelte'
	import ContextMenu from './ContextMenu.svelte'
	import { onMount, untrack } from 'svelte'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		useSvelteFlow,
		useUpdateNodeInternals
	} from '@xyflow/svelte'
	import { selectedCanvas, setNodeProps } from '$lib/stores/canvas.svelte'
	import { menuIsOpen, toggleContextMenu } from '$lib/stores/contextMenu.svelte'
	import { parseProject } from '$lib/stores/canvas.svelte'
	import '@xyflow/svelte/dist/style.css'
	import { getLayoutedNodes } from './layout.svelte'
	import { toast } from 'svelte-sonner'

	const nodeTypes: NodeTypes = {
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'endpoint-node': EndpointNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'selector-node': SelectorNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'action-node': ActionNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'agent-node': AgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'open-agent-node': OpenAgentNode,
		// @ts-expect-error type issue, not crucial but should probs be fixed
		'api-node': ApiNode
	}

	const { screenToFlowPosition } = useSvelteFlow()

	const updateNodeInternals = useUpdateNodeInternals()

	let projectIsParsed = $state(false)

	$effect(() => {
		const canvas = selectedCanvas()

		if (!canvas) return

		console.time('parse agent')
		let { nodes: nodesData, edges: edgesData } = parseProject(canvas.project)
		console.timeEnd('parse agent')

		console.log('edges', edgesData)
		untrack(async () => {
			nodesData = nodesData.map(node => {
				if (node.type === 'action-node') {
					node.data.files = undefined
				} else if (node.type === 'agent-node') {
					node.data.onOpen = () => setNodeProps(node.id as Uuid, { expanded: true })
				} else if (node.type === 'open-agent-node') {
					node.data.onOpen = () => setNodeProps(node.id as Uuid, { expanded: false })
					node.width = 400
					node.height = 400
				} else if (node.type === 'selector-node') {
				} else if (node.type === 'endpoint-node') {
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
		toggleContextMenu(true)
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault() // Allows dropping
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		const data = event.dataTransfer?.getData('application/json')
		const position = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY
		})

		if (data) {
			const { type, item } = JSON.parse(data)

			//create node
			const newNode = {
				id: item.meta.id,
				type: type,
				position,
				data: {
					name: item.meta.name,
					version: item.meta.version,
					spec: item,
					component_id: item.meta.id,
					component_version: item.meta.version
				},
				origin: [0.5, 0.0]
			} satisfies Node

			$nodes.push(newNode)
			$nodes = $nodes
		}
	}

	const flowIsEmpty = $derived($nodes.length === 0)

	function addFirstNode() {
		const triggerNode = {
			component_id: '360e6123-30c5-414b-8bbb-83b460be4f86',
			component_version: 1,
			spec: {
				resource: 'endpoint/v1',
				meta: {
					name: 'Endpoint',
					id: '360e6123-30c5-414b-8bbb-83b460be4f86',
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

<div
	class="relative grid h-full w-full"
	bind:this={wrapper}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="application"
>
	{#if projectIsParsed}
		{#if flowIsEmpty}
			<div class="-mt-32 grid place-items-center gap-10 self-center">
				<p class="opacity-50">Get started by adding your first component</p>
				<button
					onclick={addFirstNode}
					type="button"
					class="grid size-20 place-content-center rounded-full bg-zinc-300 text-4xl leading-none text-zinc-800 transition-transform duration-300 ease-(--easing-circ) hover:scale-125"
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
