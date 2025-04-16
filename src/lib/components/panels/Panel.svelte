<script lang="ts">
	import { type Props as PanelItemProps } from './PanelItem.svelte'
	import type { Snippet, Component } from 'svelte'
	import PanelItem from './PanelItem.svelte'

	interface Props {
		title: string
		desc?: string
		slot: Snippet<
			[
				{
					PanelItem: Component<PanelItemProps>
				}
			]
		>
	}

	let { title, desc, slot }: Props = $props()
</script>

<div>
	<div class="border-b-main-700 -ms-2 -me-5 mb-6 border-b ps-3 pb-4">
		<h2 class="font-semibold">{title}</h2>
		{#if desc}
			<p class="text-main-400">{desc}</p>
		{/if}
	</div>

	<div class="grid">
		{@render slot({ PanelItem })}
	</div>
</div>
