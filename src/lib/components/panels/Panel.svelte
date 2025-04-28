<script lang="ts">
	import type { Component } from 'svelte'
	import PanelItem from './PanelItem.svelte'
	import { selected } from '$lib/stores/canvas.svelte'

	interface Props {
		items: { title: string; component: Component }[]
		Icon: Component
	}

	const { items, Icon }: Props = $props()

	const title = $derived(selected.node?.data.trinode.spec.meta.name ?? 'Project')
	const desc = $derived(selected.node?.data.trinode.spec.meta.intention?.purpose)
</script>

{#key selected.node?.id}
	<div>
		<div class="border-b-main-800 mb-2 border-b px-3 pb-4">
			<h2 class="flex items-center gap-2 text-lg font-semibold">
				<Icon class="size-5" />
				{title}
			</h2>

			{#if desc}
				<p class="text-main-400 mt-1 line-clamp-2">{desc}</p>
			{/if}
		</div>

		<div class="divide-main-800 grid divide-y">
			{#each items as panelItem}
				<PanelItem title={panelItem.title} forceOpen={items.length === 1}>
					{#snippet children()}
						<panelItem.component />
					{/snippet}
				</PanelItem>
			{/each}
		</div>
	</div>
{/key}
