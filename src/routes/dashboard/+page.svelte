<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import { openWindows } from '$lib/stores/windows.svelte'
	import { loadResource, canvasStore } from '$lib/stores/canvas.svelte'

	import { mainAreaRef, setMainAreaRef } from '$lib/stores/layoutRefs.svelte'

	import ShareCanvasModal from '$lib/components/modals/ShareCanvas.svelte'

	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})

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
	
	<Flow canvas={activeCanvas} />
</section>
