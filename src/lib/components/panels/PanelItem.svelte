<script lang="ts">
	import type { Snippet } from 'svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'

	export interface Props {
		title: string
		children: Snippet
		openPanel: string
		setOpenPanel: (panel: string) => void
		forceOpen?: boolean
	}

	let { title, children, openPanel, setOpenPanel, forceOpen }: Props = $props()

	const isOpen = $derived(openPanel === title || forceOpen)
</script>

<div class="grid py-2 ps-2 pe-8">
	<button type="button" onclick={() => setOpenPanel(title)} class="me-auto flex items-center gap-1">
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
