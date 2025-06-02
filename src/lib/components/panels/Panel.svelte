<script lang="ts">
	import { type Component as SvelteComponent, type Snippet, setContext } from 'svelte'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute/Root.svelte'
	import Metadata from './items/Metadata.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import Switch from '$lib/components/atoms/Switch.svelte'
	import { type Component } from '$lib/types/agent'
	import { type Project } from '$lib/types/project'

	interface Props {
		componentData: Component | Project
		Icon?: SvelteComponent
		panels: Snippet<
			[
				{
					CodeEditor: typeof CodeEditor
					Execute: typeof Execute
					Metadata: typeof Metadata
					ProjectSettings: typeof ProjectSettings
					Variables: typeof Variables
				}
			]
		>
	}

	const { componentData, Icon, panels }: Props = $props()

	const actions = $derived.by(() => {
		const type = 'flow-node'
		getActions(type)
	})

	const handleActionClick = (fn: onClickFn) => {
		fn(componentData)
	}

	const title = $derived(componentData?.meta?.name ?? 'Project')
	const desc = $derived(componentData?.meta?.intention?.purpose)

	let useDraft = $state({ value: true })

	setContext('use-draft', useDraft)
</script>

<div class="overflow-x-hidden">
	<div class="border-b-main-800 mb-2 border-b px-3 pe-8 pb-4">
		<div class="flex items-center gap-4">
			<h2 class="flex items-center gap-2 truncate text-lg font-semibold">
				{#if Icon}
					<Icon class="size-5" />
				{/if}
				<span class="truncate">{title}</span>
			</h2>

			<ul class="ms-auto flex items-center gap-1">
				{#each actions as action}
					<li>
						<button
							aria-label={action.label}
							data-balloon-pos="down"
							onclick={() => handleActionClick(action.onClick)}
							class={[
								'rounded p-1 transition-colors',
								action.isDangerous
									? 'list-btn--danger hover:bg-danger-600/25'
									: 'hover:bg-main-700 text-main-400 hover:text-main-200'
							]}
						>
							<action.icon class="size-5" />
						</button>
					</li>
				{/each}
			</ul>

			<Switch bind:checked={useDraft.value}
				><code class="font-semibold tracking-wider uppercase">Draft</code>
				<span class="text-main-300">mode</span></Switch
			>
		</div>

		{#if desc}
			<p class="text-main-400 mt-1 line-clamp-2">{desc}</p>
		{/if}
	</div>

	{#if componentData}
		<div class="divide-main-800 grid divide-y">
			{@render panels({ CodeEditor, Execute, Metadata, ProjectSettings, Variables })}
		</div>
	{/if}
</div>
