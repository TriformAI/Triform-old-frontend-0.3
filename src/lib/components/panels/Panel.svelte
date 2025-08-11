<script lang="ts">
	import { type Component as SvelteComponent, type Snippet } from 'svelte'
	import PanelItems from './PanelItems.svelte'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	interface Props {
		nodeId: string
		Icon?: SvelteComponent
		panelItems: Snippet<[typeof PanelItems]>
	}

	const { nodeId, Icon, panelItems }: Props = $props()

	const componentData = $derived(getVisibleComponent(nodeId))
	const title = $derived(componentData?.meta?.name ?? 'Project')
	const desc = $derived(
		'intention' in componentData?.meta ? (componentData?.meta?.intention ?? '') : ''
	)
</script>

<div class="h-full">
	<div class="border-b-main-800 bg-main-950 sticky top-0 z-20 grid h-20 border-b px-3 pe-5">
		<div class="flex items-center justify-between gap-4">
			<h2 class="flex items-center gap-2 truncate text-lg font-semibold">
				{#if Icon}
					<Icon
						class={[
							'mr-1 size-6 drop-shadow-[0px_0px_5px]',
							componentData.resource === 'flow/v1'
								? 'text-complement-400 drop-shadow-complement-500'
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
		</div>
	</div>

	{#if componentData}
		{@render panelItems?.(PanelItems)}
	{/if}
</div>
