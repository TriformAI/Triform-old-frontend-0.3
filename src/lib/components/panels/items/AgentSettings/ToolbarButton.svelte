<script lang="ts">
	import type { Snippet } from 'svelte'
	import { DropdownMenu } from 'bits-ui'
	import Button from '$lib/components/atoms/Button.svelte'
	import IconAdd from '~icons/material-symbols/add-rounded'
	import { slide } from 'svelte/transition'

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

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button
			{icon}
			class="text-main-400 disabled:text-main-600 px-2 py-1"
			variation="link"
			disabled={!items.length}
			tooltip={!items.length ? `No ${label} available` : `Insert ${label}`}
		></Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			class="bg-main-900 border-main-700 z-10 w-42 rounded border py-1 transition-all"
			forceMount
		>
			{#snippet child({ wrapperProps, props, open })}
				{#if open}
					<div {...wrapperProps}>
						<div {...props} transition:slide={{ y: -10 }}>
							<div class="flex flex-col">
								{#each items as item}
									<DropdownMenu.Item
										onSelect={item.onClick}
										class={[
											'text-main-400 flex cursor-pointer flex-row items-center gap-1 overflow-hidden px-2 py-1 font-mono text-sm',
											'hover:text-main-300 hover:bg-main-800 group transition'
										]}
									>
										<IconAdd
											class="-ml-4 size-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
										/>
										{item.label}
									</DropdownMenu.Item>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
