<script lang="ts">
	import { createMenu } from 'svelte-headlessui'
	import type { Snippet } from 'svelte'
	import { fade } from 'svelte/transition'

	// Destructure props with default values
	const {
		button,
		body,
		chevron = false // Default value for chevron
	}: {
		button?: Snippet
		body: Snippet // Body is required
		chevron?: boolean
	} = $props()

	// Create the dropdown menu
	const menu = createMenu({ label: 'Dropdown Menu' })
</script>

<div class="relative z-40 inline-block text-left">
	<!-- Dropdown Trigger Button -->
	{#if button}
		<button
			use:menu.button
			class="inline-flex items-center px-3 py-3 font-light border rounded-md border-zinc-700 hover:bg-zinc-700 bg-zinc-800 focus:outline-none"
		>
			<!-- Render the button snippet -->
			{@render button()}
			<!-- Chevron icon if enabled -->
			{#if chevron}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 ml-2 transform transition duration-200 ease-in-out
			  {$menu.expanded ? '-rotate-180' : ''}"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 9l-7.5 7.5L4.5 9" />
				</svg>
			{/if}
		</button>
	{/if}

	<!-- Dropdown Menu -->
	{#if $menu.expanded}
		<div
			class="absolute right-0 mt-2 w-56 px-2 text-sm text-white bg-[#252627] border border-zinc-700 divide-y divide-zinc-700 rounded-lg shadow focus:outline-none
           [&>ul]:my-3
           [&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:p-3 [&>ul>li]:my-1 [&>ul>li]:rounded-md [&>ul>li]:gap-4
           [&>ul>li]:transition-colors [&>ul>li]:duration-200 [&>ul>li]:ease-in-out
           [&>ul>li:hover]:bg-zinc-600"
			use:menu.items
			transition:fade={{ duration: 200 }}
		>
			<!-- Render the body snippet -->
			{@render body()}
		</div>
	{/if}
</div>

<!-- <style>
	:global(.menu-list > ul) {
		@apply my-3;
	}
	:global(.menu-list > ul > li) {
		@apply flex items-center p-3 my-1 rounded-md gap-4 transition-colors duration-200 ease-in-out;
	}

	:global(.menu-list > ul > li:hover) {
		@apply bg-zinc-600;
	}
</style> -->
