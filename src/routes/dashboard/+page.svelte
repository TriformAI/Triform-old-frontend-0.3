<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { SvelteFlow, Background } from '@xyflow/svelte'

	import { openWindows, openWindow } from '$lib/stores/windows.svelte'

	import { mainAreaRef, setMainAreaRef } from '$lib/stores/layoutRefs.svelte'
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'

	import ShareCanvasModal from '$lib/components/modals/ShareCanvas.svelte'
	import CodeEditorWindow from '$lib/components/windows/CodeEditorWindow.svelte'

	const nodeTypes = {
		'action-node': ActionNode,
		'agent-node': AgentNode,
		'api-node': ApiNode
	}

	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes = writable([
		{
			id: '1',
			type: 'api-node',
			position: { x: 80, y: 0 },
			data: {
				name: 'API Node A',
				mode: 'running'
			}
		},
		{
			id: '2',
			type: 'agent-node',
			position: { x: 0, y: 120 },
			data: {
				name: 'Agent Node A',
				mode: 'error'
			}
		},
		{
			id: '3',
			type: 'action-node',
			position: { x: 80, y: 250 },
			data: {
				name: 'Action Node A',
				mode: 'success'
			}
		},
		{
			id: '4',
			type: 'api-node',
			position: { x: 300, y: 0 },
			data: {
				name: 'API Node B',
				mode: 'success'
			}
		},
		{
			id: '5',
			type: 'agent-node',
			position: { x: 230, y: 120 },
			data: {
				name: 'Agent Node B',
				mode: 'running'
			}
		},
		{
			id: '6',
			type: 'action-node',
			position: { x: 300, y: 250 },
			data: {
				name: 'Action Node B',
				mode: 'error'
			}
		}
	])

	// same for edges
	const edges = writable([
		{
			id: '1-2',
			type: 'default',
			source: '1',
			target: '2',
			animated: true
		},
		{
			id: '2-3',
			type: 'default',
			source: '2',
			target: '3',
			animated: true
		},
		{
			id: '4-5',
			type: 'default',
			source: '4',
			target: '5',
			animated: true
		},
		{
			id: '5-6',
			type: 'default',
			source: '5',
			target: '6',
			animated: true
		},

		{
			id: '5-3',
			type: 'default',
			source: '5',
			target: '3',
			animated: true
		}
	])

	const snapGrid: [number, number] = [1, 1]

	const proOptions = { hideAttribution: true }

	const defaultEdgeOptions = {
		animated: true // Ensures all edges are animated
	}
	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})

	const code = `
	import re
	import json
 	import html
 	from bs4 import BeautifulSoup

 	def handler(event, context):
     	# Extract the HTML content from the event object. This content is expected to be passed in 'output_0'.
     	input_html = event.get("output_0")`

	const readMe = `# Triform.ai Template: HTTP GET Request Handler
 
 ## Overview
 
 This Python module, designed for Triform.ai, serves as a template for handling HTTP GET requests. It fetches and returns webpage content in JSON format, which can be incorporated into broader AI workflows on the Triform platform.
 
 ## Use Cases
 
 - Fetching data from external APIs for processing.
 - Integrating real-time web data into AI models.
 
`

	const requirement = `beautifulsoup4
	requests
	json`
</script>

<section class="h-[calc(100vh-156.1px)] relative" bind:this={instance}>
	{#each openWindows() as window}
		{@const { component: Component, customProps, ...defaultProps } = window}
		<Component {...defaultProps} {customProps} />
	{/each}

	<ShareCanvasModal />

	<button
		class="m-4 text-white"
		onclick={() =>
			openWindow({
				id: 'code-editor',
				component: CodeEditorWindow,
				posX: 20,
				posY: 20,
				width: 800,
				height: 600,
				zIndex: 100,
				customProps: {
					'Edit Action': code,
					'README.md': readMe,
					"Requirements": requirement,
					'Folder Structure': 'Something random'
				}
			})}
	>
		Code Editor Window
	</button>
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView {snapGrid} {proOptions} {defaultEdgeOptions}>
		<Background bgColor="#181819" patternColor="#1D1E20" variant="lines" gap={20} size={1} />
	</SvelteFlow>
</section>
