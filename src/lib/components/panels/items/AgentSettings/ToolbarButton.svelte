<script lang="ts">
	import type { Snippet } from 'svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import Dropdown from '$lib/components/atoms/Dropdown.svelte'
	import DropdownItem from '$lib/components/atoms/DropdownItem.svelte'
	import IconAdd from '~icons/material-symbols/add-rounded'

	const {
		icon,
		items,
		label
	}: {
		icon: Snippet
		items: { label: string; onClick: () => void }[]
		label: string
	} = $props()
</script>

<Dropdown>
	{#snippet trigger()}
		<Button
			{icon}
			class="text-main-400 disabled:text-main-600 px-2 py-1"
			variation="link"
			disabled={!items.length}
			tooltip={!items.length ? `No ${label} available` : `Insert ${label}`}
		></Button>
	{/snippet}

	{#snippet children()}
		<div class="flex flex-col">
			{#each items as item}
				<DropdownItem
					onSelect={item.onClick}
					class="flex gap-2 overflow-hidden font-mono text-sm font-medium"
				>
					<IconAdd
						class="-ml-4.5 size-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
					/>
					{item.label}
				</DropdownItem>
			{/each}
		</div>
	{/snippet}
</Dropdown>
