<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { ButtonVariation } from '$lib/components/atoms/Button.svelte'
	
	import { createMenu } from 'svelte-headlessui'
	import { fade } from 'svelte/transition'

	import Button from '../atoms/Button.svelte'
	import List from '../atoms/List.svelte'

	// Destructure props with default values
	const {
		button, // Button is required, evoke for the dropdown
		buttonVariation,
		body, // Body is required, content of the dropdown
		chevron = false // Default value for chevron, dropdown icon at the end of the button
	}: {
		button?: Snippet
		buttonVariation?: ButtonVariation
		body: Snippet
		chevron?: boolean
	} = $props()

	// Create the dropdown menu
	const menu = createMenu({ label: 'Dropdown Menu' })
</script>

<div class="relative z-40 inline-block text-left">
	<!-- Dropdown Trigger Button -->
	{#if button}
		<div
			use:menu.button
		>
			<Button
				variation={buttonVariation}
			>
				{#snippet body()}
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
				{/snippet}
			</Button>
		</div>
	{/if}

	<!-- Dropdown Menu -->
	{#if $menu.expanded}
		<div
			use:menu.items
			transition:fade={{ duration: 200 }}
			class="absolute right-0 mt-2"
		>
			<List {body} />
		</div>
	{/if}
</div>
