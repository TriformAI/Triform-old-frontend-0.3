<script lang="ts">
	import type { Snippet } from 'svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import { selected, toggleOpenPanelItem } from '$lib/stores/panel.svelte'

	export interface Props {
		title: string
		children: Snippet
		forceOpen?: boolean
	}

	let { title, children, forceOpen }: Props = $props()

	const isOpen = $derived(selected.openPanelItems.includes(title) || forceOpen)
</script>

<div class="grid py-2 ps-2 pe-8">
	<button
		type="button"
		onclick={() => toggleOpenPanelItem(selected.node?.id, title)}
		class="me-auto flex items-center gap-1"
	>
		<IconChevronRight class={['transition-transform', isOpen ? 'rotate-90' : '']} />
		<h2 class="eyebrow inline-flex">{title}</h2>
	</button>

	<div
		class={[
			'overflow-y-hidden ps-6 transition-all duration-300',
			isOpen ? 'max-h-max pt-4 ease-out' : 'h-0 overflow-hidden ease-in'
		]}
	>
		<div class="pb-6">
			{@render children()}
		</div>
	</div>
</div>
