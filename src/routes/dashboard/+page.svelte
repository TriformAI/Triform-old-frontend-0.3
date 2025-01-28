<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import {
		openWindows,
		createLocalStorageListener,
		loadWindowsFromLocalStorage,
		removeLocalStorageListener
	} from '$lib/stores/windows.svelte'
	import {
		loadAgent,
		canvasStore,
		openAgents
	} from '$lib/stores/canvas.svelte'

	import type { Agent } from '$lib/types/agent'

	import { setMainAreaRef } from '$lib/stores/layoutRefs.svelte'
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	import ShareCanvasModal from '$lib/components/modals/ShareCanvas.svelte'

	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})

	// import testInvocation from '$lib/dev/test-invocation.json'
	// const invocation = testInvocation
	import testAgent from '$lib/dev/test-agent.json'
	onMount(() => {
		console.log('mount')
		loadAgent(testAgent as Agent)

		// console.log('actions', actionsStore())
	})

	const activeCanvas = $derived(canvasStore[0])
	const openCanvasAgents = $derived(openAgents)

	onMount(() => {
		loadWindowsFromLocalStorage()
		createLocalStorageListener()
		;() => {
			removeLocalStorageListener()
		}
	})
</script>

<section class="flex flex-col h-screen" bind:this={instance}>
	{#each openWindows() as window}
		{@const { component: Component, customProps, ...defaultProps } = window}
		<Component {...defaultProps} {customProps} />
	{/each}

	<ShareCanvasModal />

	<Flow canvas={activeCanvas} openAgents={openCanvasAgents} />
</section>
