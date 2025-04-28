<script lang="ts">
	import type { Component, Snippet } from 'svelte'

	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute.svelte'
	import Metadata from './items/Metadata.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'

	import { selected } from '$lib/stores/canvas.svelte'

	interface Props {
		Icon?: Component
		panels: Snippet<
			[
				{
					CodeEditor: Component
					Execute: Component
					Metadata: Component
					ProjectSettings: Component
					Variables: Component
				}
			]
		>
	}

	const { Icon, panels }: Props = $props()

	const title = $derived(selected.node?.data.trinode.spec.meta.name ?? 'Project')
	const desc = $derived(selected.node?.data.trinode.spec.meta.intention?.purpose)
</script>

{#key selected.node?.id}
	<div>
		<div class="border-b-main-800 mb-2 border-b px-3 pb-4">
			<h2 class="flex items-center gap-2 text-lg font-semibold">
				{#if Icon}
					<Icon class="size-5" />
				{/if}
				{title}
			</h2>

			{#if desc}
				<p class="text-main-400 mt-1 line-clamp-2">{desc}</p>
			{/if}
		</div>

		<div class="divide-main-800 grid divide-y">
			{@render panels({ CodeEditor, Execute, Metadata, ProjectSettings, Variables })}
		</div>
	</div>
{/key}
