<script lang="ts">
	import type { Canvas } from '$lib/stores/canvas.svelte'
	import type { Node, Edge, NodeTypes } from '@xyflow/svelte'

	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import OpenAgentNode from '$lib/components/custom-nodes/OpenAgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import ContextMenu from '../custom-nodes/ContextMenu.svelte'

	import { writable } from 'svelte/store'
	import { onMount, untrack } from 'svelte'
	import { SvelteFlow, Background, BackgroundVariant } from '@xyflow/svelte'

	import { menuIsOpen, toggleMenu } from '$lib/stores/contextMenu.svelte'
	import dagre from '@dagrejs/dagre'

	import '@xyflow/svelte/dist/style.css'
	import { parseTree } from './helpers.svelte'

	const { canvas }: { canvas: Canvas } = $props()

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

	const nodes = writable<Node[]>([])
	const edges = writable<Edge[]>([])

	const openAgents: { [key: string]: boolean } = $state({ test_agent: false })
	$effect(() => {
		nodes.set([])
		edges.set([])
		if (!canvas) return
		const dagreGraph = new dagre.graphlib.Graph()
		dagreGraph.setDefaultEdgeLabel(() => ({}))
		dagreGraph.setGraph({ rankdir: 'TB' })
		const nodeSize = 60

		const { nodes: nodesData, edges: edgesData } = parseTree(canvas, openAgents)

		// Used to get effect to trigger on canvas.resource change
		const ref = canvas.resource
		untrack(async () => {
			var layoutNodes: Node[] = nodesData.map(n => {
				var width = nodeSize
				var height = nodeSize + (n.data.name as string).length * 3
				if (n.type === 'action-node') {
					/*n.data.onOpen = () =>
					openWindow({
						id: `code-editor-action-${n.id}`,
						component: CodeEditorWindow,
						posX: 20,
						posY: 20,
						customProps: {
							files: n.data.files,
							actionKey: n.id
						}
          })*/
					n.data.files = undefined
				} else if (n.type === 'agent-node') {
					n.data.onOpen = () => {
						console.log('xxxx opening agent', n)
						openAgents[n.id] = true
					}
				} else if (n.type === 'open-agent-node') {
					n.data.onOpen = () => {
						console.log('xxxx closing agent', n)
						openAgents[n.id] = false
					}
					width = 0
					height = 0
					n.width = 400
					n.height = 400
				} else {
					throw new Error('unknown node type ' + n.type)
				}

				dagreGraph.setNode(n.id, {
					width: width,
					height: height
				})
				// we have added position and onClick stuff so I'd say we are safe
				// to force it to finally become a true node.
				return n as unknown as Node
			})

			edgesData.forEach(e => {
				dagreGraph.setEdge(e.source, e.target)
			})

			dagre.layout(dagreGraph)
			edges.set(edgesData)

			layoutNodes = layoutNodes.map(n => {
				const d = dagreGraph.node(n.id)
				console.log('xxx d.x', d.x, 'd.y', d.y)
				n.position = {
					x: d.x - nodeSize / 2,
					y: d.y - nodeSize / 2
				}
				return n
			})
			nodes.set(layoutNodes)
			console.log('xxx nodes', layoutNodes)
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

<div class="h-full w-full relative" bind:this={wrapper}>
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
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
