<script lang="ts">
	import { type Props as PanelItemProps } from './PanelItem.svelte'
	import type { Snippet, Component } from 'svelte'
	import PanelItem from './PanelItem.svelte'
	import { selected, setOpenPanel as setSelectedOpenPanel } from '$lib/stores/canvas.svelte'

	interface Props {
		Icon: Component
		slot: Snippet<
			[
				{
					PanelItem: Component<PanelItemProps>
					setOpenPanel: (panel: string) => void
				}
			]
		>
	}

	let { slot, Icon }: Props = $props()

	const title = $derived(selected.node?.data.trinode.spec.meta.name ?? 'Project')
	const desc = $derived(selected.node?.data.trinode.spec.meta.intention?.purpose)

	let openPanel = $derived(selected.openPanel)

	const setOpenPanel = (panel: string) => {
		const newVal = openPanel === panel ? '' : panel

		setSelectedOpenPanel(selected.node?.id, newVal)
	}
</script>

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
		{@render slot({ PanelItem, openPanel, setOpenPanel })}
	</div>
</div>
