<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'
	import Toolbar from '$lib/components/canvas/Toolbar.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'

	import {
		openWindows,
		// createLocalStorageListener,
		// loadWindowsFromLocalStorage,
		clearLocalStorage
		// removeLocalStorageListener
	} from '$lib/stores/windows.svelte'

	import { loadProject, unloadProject } from '$lib/stores/canvas.svelte'

	import type { Project } from '$lib/types/project'

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	import testProject from '$lib/dev/test-project.json'

	onMount(() => {
		loadProject(testProject as Project)
	})

	onMount(() => {
		clearLocalStorage()
		// loadWindowsFromLocalStorage()
		// createLocalStorageListener()
		// eslint-disable-next-line
		// ;() => {
		// 	removeLocalStorageListener()
		// }
	})

	onDestroy(() => {
		unloadProject()
		// removeLocalStorageListener()
	})
</script>

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
