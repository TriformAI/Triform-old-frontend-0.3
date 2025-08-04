<script lang="ts">
	import Project from '$lib/components/panels/Project.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import { twMerge } from 'tailwind-merge'
	import PanelWrapper from './panels/PanelWrapper.svelte'

	let { class: classes }: { class?: string } = $props()
</script>

<div
	class={twMerge(
		'custom-scrollbar scroll-gutter-stable bg-main-950/60 border-main-800 @container row-span-3 mb-2 overflow-y-auto rounded-lg border pb-4',
		classes
	)}
>
	{#if selected.isMultiple}
		<p class="mx-3">Multiple nodes selected</p>
	{:else if getCurrentContainer() && selected.node}
		<PanelWrapper />
	{:else}
		<Project />
	{/if}
</div>
