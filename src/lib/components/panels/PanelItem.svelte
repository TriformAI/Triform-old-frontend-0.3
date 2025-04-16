<script lang="ts">
	import type { Snippet } from 'svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'

	export interface Props {
		title: string
		children: Snippet
		isOpen?: boolean
	}

	let { title, children, isOpen = true }: Props = $props()
</script>

<div class="grid gap-4">
	<button type="button" onclick={() => (isOpen = !isOpen)} class="flex items-center gap-1">
		<IconChevronRight class={['transition-transform', isOpen ? 'rotate-90' : '']} />
		<h2 class="eyebrow">{title}</h2>
	</button>

	<div
		class={[
			'overflow-y-hidden ps-6 transition-all duration-300',
			isOpen ? 'max-h-max ease-out' : 'h-0 overflow-hidden ease-in'
		]}
	>
		<div class="pb-10">
			{@render children()}
		</div>
	</div>
</div>
