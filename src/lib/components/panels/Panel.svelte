<script lang="ts">
	import { type Component as SvelteComponent, type Snippet, setContext, onMount } from 'svelte'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import type { Component, Project } from '$lib/types/resources'
	import { isFlow } from '$lib/types/resources'
	import Button from '$lib/components/atoms/Button.svelte'
	import DirtyNote from '../DirtyNote.svelte'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'
	import { updateNodeComponent } from '$lib/stores/canvas.svelte'
	import PanelItems from './PanelItems.svelte'

	const api = new API()

	interface Props {
		componentData: Component | Project
		Icon?: SvelteComponent
		panelItems: Snippet<[typeof PanelItems]>
	}

	const { componentData, Icon, panelItems }: Props = $props()

	const isDirty = false // FIXME

	const actions = $derived.by(() => {
		const type = 'flow-node'
		getActions(type)
	})

	const publishComponent = async () => {
		if (componentData.resource === 'project/v1') return

		let result: Component | undefined = undefined
		try {
			result = await api.put<Component>(`components/${componentData.id}`, componentData)
			// if it was a flow that we updated, we won't get back the full resolved component so we
			// need to re-populate the local (fully resolved) spec before updating it
			if (isFlow(componentData)) result.spec = componentData.spec
			result = $state.snapshot(result)
			await api.delete(`components/${componentData.id}/draft`)
		} catch (error) {
			console.error(error)
			toast.error('Failed to publish component')
		}

		if (result) updateNodeComponent(result)
		else console.error('Result was undefined')
		toast.success('Component published')
	}

	const title = $derived(componentData?.meta?.name ?? 'Project')
	const desc = $derived(componentData?.meta?.intention?.purpose)

	let useDraft = $state({ value: true })

	setContext('use-draft', useDraft)
</script>

<div>
	<div class="border-b-main-800 bg-main-950 sticky top-0 z-20 grid h-20 border-b px-3 pe-5">
		<div class="flex items-center justify-between gap-4">
			<h2 class="flex items-center gap-2 truncate text-lg font-semibold">
				{#if Icon}
					<Icon
						class={[
							'mr-1 size-6 drop-shadow-[0px_0px_5px]',
							componentData.resource === 'flow/v1'
								? 'text-accent-400 drop-shadow-accent-500'
								: 'text-main-300 drop-shadow-main-300/50'
						]}
					/>
				{/if}
				<div class="flex flex-col">
					<span class="truncate">{title}</span>
					{#if desc}
						<p class="text-main-500 line-clamp-2 truncate text-sm font-medium">{desc}</p>
					{/if}
				</div>
			</h2>

			<div class="flex flex-row items-center gap-4">
				{#if !isProject(componentData)}
					<DirtyNote show={isDirty} />
					<Button
						variation="vibrant"
						disabled={!isDirty}
						onClick={publishComponent}
						autoLoad="promise">Publish</Button
					>
				{/if}

				<!-- <ul class="ms-auto flex items-center gap-1">
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
				</ul> -->
			</div>
		</div>
	</div>

	{#if componentData}
		{@render panelItems?.(PanelItems)}
	{/if}
</div>
