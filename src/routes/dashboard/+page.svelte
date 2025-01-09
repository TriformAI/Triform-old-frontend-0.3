<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import { openWindows } from '$lib/stores/windows.svelte'
	import { loadResource, canvasStore } from '$lib/stores/canvas.svelte'

	import { setMainAreaRef } from '$lib/stores/layoutRefs.svelte'
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	import ShareCanvasModal from '$lib/components/modals/ShareCanvas.svelte'

	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})

	import testInvocation from '$lib/dev/test-invocation.json'
	import type { Invocation } from '$lib/types/test-invocation'

	const invocation: Invocation = testInvocation as Invocation
	onMount(() => {
		loadResource(invocation.spec)
	})

	const activeCanvas = $derived(canvasStore[0])
</script>

<section class="flex flex-col h-full" bind:this={instance}>
	{#each openWindows() as window}
		{@const { component: Component, customProps, ...defaultProps } = window}
		<Component {...defaultProps} {customProps} />
	{/each}

	<ShareCanvasModal />

	<Flow canvas={activeCanvas} />
</section>
