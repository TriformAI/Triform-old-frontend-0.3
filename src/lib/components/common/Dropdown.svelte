<script lang="ts">
	import { clickOutside } from '$lib/utils/clickOutside'
	import type { Snippet } from 'svelte'

	type Type = 'default' | 'tight'

	interface Props {
		open?: boolean
		trigger: Snippet
		body: Snippet
		type?: Type
		class?: string
	}

	let { open = $bindable(), trigger, body, type = 'default', class: classes }: Props = $props()

	let window_event_listener: ((event: KeyboardEvent) => void) | null = null

	$effect(() => {
		if (open) {
			window_event_listener = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					open = false
				}
			}
			window.addEventListener('keydown', window_event_listener)
		} else {
			if (window_event_listener) {
				window.removeEventListener('keydown', window_event_listener)
			}
		}
	})
</script>

<div
	class={[classes, 'relative']}
	use:clickOutside={{
		handler: () => {
			open = false
		}
	}}
>
	<button
		type="button"
		onclick={e => {
			e.stopPropagation()
			open = !open
		}}
	>
		{@render trigger()}
	</button>

	<div
		class={[
			'dropdown bg-main-850 shadow-window absolute end-0 z-10 min-w-56 origin-top-right rounded-md p-1 duration-200 ease-(--easing-circ)',
			open ? 'scale-100 opacity-100 duration-150' : 'pointer-events-none scale-90 opacity-0',
			type === 'tight' && 'dropdown--tight'
		]}
	>
		{@render body()}
	</div>
</div>

<style>
	@starting-style {
		.dropdown {
			transform: scale(0.9);
			opacity: 0;
		}
	}
</style>
