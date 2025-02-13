<script lang="ts">
	import { onMount } from 'svelte'
	import Flow from '$lib/components/canvas/Flow.svelte'

	import {
		openWindows,
		createLocalStorageListener,
		loadWindowsFromLocalStorage,
		removeLocalStorageListener
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
		loadWindowsFromLocalStorage()
		createLocalStorageListener()
		;() => {
			removeLocalStorageListener()
		}
	})
</script>

<div class="flex h-screen flex-col">
	{#each openWindows() as window}
		{@const { component: Component, customProps, ...defaultProps } = window}
		<Component {...defaultProps} {customProps} />
	{/each}

	<Flow />
</div>
