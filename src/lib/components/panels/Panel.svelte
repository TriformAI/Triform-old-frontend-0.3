<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute/Root.svelte'
	import Metadata from './items/Metadata.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'

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

	const actions = $derived(getActions(selected.node?.type ?? ''))

	const handleActionClick = (fn: onClickFn) => {
		fn(selected.node!)
	}

	const { Icon, panels }: Props = $props()

	const title = $derived(selected.node?.data?.trinode?.spec?.meta?.name ?? 'Project')
	const desc = $derived(selected.node?.data?.trinode?.spec?.meta?.intention?.purpose)
</script>

{#key selected.node?.id}
	<div class="overflow-x-hidden">
		<div class="border-b-main-800 mb-2 border-b px-3 pb-4">
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
			</div>

			{#if desc}
				<p class="text-main-400 mt-1 line-clamp-2">{desc}</p>
			{/if}
		</div>

		<div class="divide-main-800 grid divide-y">
			{@render panels({ CodeEditor, Execute, Metadata, ProjectSettings, Variables })}
		</div>
	</div>
{/key}
