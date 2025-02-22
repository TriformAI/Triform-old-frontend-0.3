<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'
	import Toolbar from '$lib/components/canvas/Toolbar.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { beforeNavigate, goto } from '$app/navigation'
	import type { BeforeNavigate } from '@sveltejs/kit'

	import {
		openWindows,
		// createLocalStorageListener,
		// loadWindowsFromLocalStorage,
		clearLocalStorage
		// removeLocalStorageListener
	} from '$lib/stores/windows.svelte'

	import { currentCanvas, loadProject, unloadProject } from '$lib/stores/canvas.svelte'

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	const { data } = $props()

	// Warn if the user tries to close the page with unsaved changes
	const beforeUnload = (event: BeforeUnloadEvent) => {
		console.log('unloading')
		if (currentCanvas.hasUnsavedChanges) {
			event.preventDefault() // modern browsers
			event.returnValue = '' // older browsers
		}
	}

	beforeNavigate(async (navigation: BeforeNavigate) => {
		// For some reason we can't use our confirmstore here, because goto doesn't work after cancelling...
		// So need to emulate the normal browser "unsaved changes" prompt with a confirm dialog
		if (
			currentCanvas.hasUnsavedChanges &&
			!window.confirm('You have unsaved changes, are you sure you want to leave?')
		)
			navigation.cancel()
	})

	onMount(() => {
		loadProject(data.project, true)
		clearLocalStorage()
		// loadWindowsFromLocalStorage()
		// createLocalStorageListener()

		// ;() => {
		// 	removeLocalStorageListener()
		// }
	})

	onDestroy(() => {
		unloadProject()
		// removeLocalStorageListener()
	})
</script>

<svelte:window onbeforeunload={beforeUnload} />

<SvelteFlowProvider>
	<div class="relative flex h-full flex-col contain-paint">
		{#each openWindows() as { component: Component, customProps, ...defaultProps }}
			<Component {...defaultProps} {customProps} />
		{/each}

		<Flow />

		<Toolbar />
	</div>
</SvelteFlowProvider>

<Confirm />
