<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import {
		openWindows,
		createLocalStorageListener,
		loadWindowsFromLocalStorage,
		removeLocalStorageListener
	} from '$lib/stores/windows.svelte'

	import { loadAgent, canvasStore } from '$lib/stores/canvas.svelte'

	import type { Agent } from '$lib/types/agent'

	import { setMainAreaRef } from '$lib/stores/layoutRefs.svelte'
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	let instance: HTMLElement

	onMount(() => {
		setMainAreaRef(instance)
	})

	// import testInvocation from '$lib/dev/test-invocation.json'
	// const invocation = testInvocation
	import testAgent from '$lib/dev/test-agent.json'

	onMount(() => {
		loadAgent(testAgent as Agent)
	})

	const activeCanvas = $derived(canvasStore[0])

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

	<Flow canvas={activeCanvas} />
</section>
