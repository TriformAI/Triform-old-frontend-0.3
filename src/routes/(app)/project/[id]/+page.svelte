<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	// import { beforeNavigate } from '$app/navigation'
	// import type { BeforeNavigate } from '@sveltejs/kit'

	import {
		unloadWindows,
		// createLocalStorageListener,
		// loadWindowsFromLocalStorage,
		clearLocalStorage
		// removeLocalStorageListener
	} from '$lib/stores/windows.svelte'

	import { loadProject, unloadProject } from '$lib/stores/canvas.svelte'

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import ColResizer from '$lib/components/ColResizer.svelte'

	const { data } = $props()

	// // Warn if the user tries to close the page with unsaved changes
	// const beforeUnload = (event: BeforeUnloadEvent) => {
	// 	console.log('unloading')
	// 	if (currentCanvas.hasUnsavedChanges) {
	// 		event.preventDefault() // modern browsers
	// 		event.returnValue = '' // older browsers
	// 	}
	// }

	// beforeNavigate(async (navigation: BeforeNavigate) => {
	// 	// For some reason we can't use our confirmstore here, because goto doesn't work after cancelling...
	// 	// So need to emulate the normal browser "unsaved changes" prompt with a confirm dialog
	// 	if (
	// 		currentCanvas.hasUnsavedChanges &&
	// 		!window.confirm('You have unsaved changes, are you sure you want to leave?')
	// 	)
	// 		navigation.cancel()
	// })

	onMount(() => {
		loadProject(data.project)
		clearLocalStorage()
		// loadWindowsFromLocalStorage()
		// createLocalStorageListener()

		// ;() => {
		// 	removeLocalStorageListener()
		// }
	})

	onDestroy(() => {
		unloadProject()
		unloadWindows()
		// removeLocalStorageListener()
	})

	let gridContainer = $state<HTMLDivElement>()
	let flowComponent = $state<Flow>()
</script>

<svelte:head>
	<title>{data.project.meta.name} | Triform</title>
</svelte:head>

<SvelteFlowProvider>
	<div bind:this={gridContainer} class="bg-main-800 grid h-full grid-cols-[1fr_4px_450px] pt-1">
		<Flow bind:this={flowComponent} />

		<ColResizer
			{gridContainer}
			onResizeEnd={() =>
				flowComponent?.fitView({
					maxZoom: 1,
					minZoom: 1,
					duration: 500
				})}
		/>

		<PropsPanel />
	</div>

	<!-- <Toolbar /> -->
</SvelteFlowProvider>

<Confirm />
