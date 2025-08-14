<script lang="ts">
	import Project from '$lib/components/panels/Project.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import { getCurrentContainer, getProject } from '$lib/stores/canvas.svelte'
	import { twMerge } from 'tailwind-merge'
	import PanelWrapper from './panels/PanelWrapper.svelte'
	import { isProject } from '$lib/schemas'

	let { class: classes }: { class?: string } = $props()
</script>

<div
	class={twMerge(
		'custom-scrollbar scroll-gutter-stable bg-main-950/60 border-main-800 @container row-span-3 mb-2 overflow-y-auto rounded-lg border pb-4',
		'h-full',
		classes
	)}
>
	{#if selected.isMultiple}
		<p class="mx-3">Multiple nodes selected</p>
	{:else if getProject() && isProject(getCurrentContainer()) && !selected.node}
		<Project />
	{:else}
		<PanelWrapper />
	{/if}
</div>
