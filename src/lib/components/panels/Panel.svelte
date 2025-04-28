<script lang="ts">
	import type { Component } from 'svelte'
	import PanelItems from './PanelItems.svelte'
	import { selected } from '$lib/stores/canvas.svelte'

	interface Props {
		items: { title: string; component: Component }[]
		Icon: Component
	}

	const { items, Icon } = $props()
</script>

{#key selected.node?.id}
	<PanelItems {Icon}>
		{#snippet slot({ PanelItem, openPanel, setOpenPanel })}
			{#each items as panel}
				<PanelItem title={panel.title} {openPanel} forceOpen={items.length === 1} {setOpenPanel}>
					{#snippet children()}
						<panel.component />
					{/snippet}
				</PanelItem>
			{/each}
		{/snippet}
	</PanelItems>
{/key}
