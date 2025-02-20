<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'
	import Toolbar from '$lib/components/canvas/Toolbar.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'

	import {
		openWindows,
		// createLocalStorageListener,
		// loadWindowsFromLocalStorage,
		clearLocalStorage
		// removeLocalStorageListener
	} from '$lib/stores/windows.svelte'

	import { loadProject } from '$lib/stores/canvas.svelte'

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
</script>

<SvelteFlowProvider>
	<div class="relative flex h-full flex-col contain-paint">
		{#each openWindows() as window}
			{@const { component: Component, customProps, ...defaultProps } = window}
			<Component {...defaultProps} {customProps} />
		{/each}

		<Flow />

		<Toolbar />
	</div>
</SvelteFlowProvider>
