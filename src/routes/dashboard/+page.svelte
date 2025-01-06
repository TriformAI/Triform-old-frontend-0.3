<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import { openWindows, openWindow } from '$lib/stores/windows.svelte'
	import { loadResource, canvasStore } from '$lib/stores/canvas.svelte'

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

	const snapGrid: [number, number] = [1, 1]

	const proOptions = { hideAttribution: true }

	const defaultEdgeOptions = {
		animated: true // Ensures all edges are animated
	}
	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})

	const code = `import re
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

	const requirement = 'beautifulsoup4\nrequests\njson'

	import testInvocation from '$lib/dev/test-invocation.json'
	const invocation = testInvocation
	onMount(() => {
		console.log('mount')
		loadResource(invocation.spec)
	})

	const activeCanvas = $derived(canvasStore[0])
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
					'Folder Structure': 'Something random',
				}
			})}
	>
		Code Editor Window
	</button>
	<Flow canvas={activeCanvas} />
</section>
