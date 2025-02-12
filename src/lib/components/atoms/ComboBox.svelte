<script lang="ts">
	import { Combobox } from 'bits-ui'
	import IconArrowDown from '~icons/material-symbols/keyboard-arrow-down'
	import IconDoubleArrowDown from '~icons/material-symbols/keyboard-double-arrow-down'
	import IconDoubleArrowUp from '~icons/material-symbols/keyboard-double-arrow-up'

	const nodeTypes = [
		{ value: 'action', label: 'Action' },
		{ value: 'flow', label: 'Flow' }
	]

	let searchValue = $state('')

	const filteredNodeTypes = $derived(
		searchValue === ''
			? nodeTypes
			: nodeTypes.filter(item => item.label.toLowerCase().includes(searchValue.toLowerCase()))
	)

	function focus(el) {
		el.focus()
	}
</script>

<Combobox.Root
	open={true}
	type="multiple"
	name="favoriteFruit"
	onOpenChange={o => {
		if (!o) searchValue = ''
	}}
>
	<div class="relative">
		<Combobox.Input
			autofocus
			oninput={e => (searchValue = e.currentTarget.value)}
			class="w-full rounded border border-zinc-700 bg-zinc-800 p-3 outline-0"
			placeholder="Search components"
			aria-label="Search components"
		/>
		<Combobox.Trigger class="absolute end-3 top-1/2 size-6 -translate-y-1/2">
			<IconArrowDown class="size-5.5 text-zinc-200" />
		</Combobox.Trigger>
	</div>

	<Combobox.Portal>
		<Combobox.Content
			class="max-h-96 w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-lg border border-zinc-800 bg-zinc-800  text-zinc-100 outline-none"
			sideOffset={10}
		>
			<Combobox.ScrollUpButton class="flex w-full items-center justify-center">
				<IconDoubleArrowUp />
			</Combobox.ScrollUpButton>

			<Combobox.Viewport class="p-1 text-sm">
				{#each filteredNodeTypes as fruit, i (i + fruit.value)}
					<Combobox.Item
						class="rounded-button flex w-full items-center rounded px-3 py-2 text-sm capitalize outline-none select-none data-[highlighted]:bg-zinc-900/50"
						value={fruit.value}
						label={fruit.label}
					>
						{#snippet children({ selected })}
							{fruit.label}
							{#if selected}
								<div class="ml-auto">✓</div>
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span class="block p-2 text-sm text-muted-foreground">
						No results found, try again.
					</span>
				{/each}
			</Combobox.Viewport>

			<Combobox.ScrollDownButton class="flex w-full items-center justify-center">
				<IconDoubleArrowDown />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
