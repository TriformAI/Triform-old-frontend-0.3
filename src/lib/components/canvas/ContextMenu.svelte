<script lang="ts">
	import type { Node, NodeType } from '$lib/types/flow'

	import { contextMenus, menuIsOpen, toggleMenu } from '$lib/stores/contextMenu.svelte'

	import List from '../atoms/List.svelte'

	const {
		node,
		top,
		left,
		right,
		bottom
	}: {
		node?: Node
		top: number
		left: number
		right: number
		bottom: number
	} = $props()

	const items = contextMenus.get(node?.type as NodeType) ?? []

	let element: HTMLElement

	const closeEvents = ['click', 'mousedown', 'touchstart']
	const closeMenu = (event: Event) => {
		// If any of the parents are the menu, don't close it
		if (element && (event.target === element || element.contains(event.target as HTMLElement)))
			return
		toggleMenu(false)
		for (const event of closeEvents) window.removeEventListener(event, closeMenu)
	}
	$effect(() => {
		if (menuIsOpen()) for (const event of closeEvents) window.addEventListener(event, closeMenu)
		else closeMenu(new Event('click')) // make sure the event listeners are cleaned up
	})

	const itemClick = (action?: (arg?: Node) => void) => {
		// Close menu before executing the action
		toggleMenu(false)
		action?.(node)
	}
</script>

<div
	style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
	class="absolute z-10"
	bind:this={element}
>
	<List>
		{#snippet body()}
			<ul>
				{#each items as { label, onClick }}
					<li class="rounded">
						<button class="w-full cursor-pointer" onclick={() => itemClick(onClick)}>
							{label}
						</button>
					</li>
				{/each}
			</ul>
		{/snippet}
	</List>
</div>
