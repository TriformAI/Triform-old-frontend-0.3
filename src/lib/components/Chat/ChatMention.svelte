<script lang="ts">
	import { Combobox } from 'bits-ui'
	import { nodeTypes } from '$lib/constants/nodeTypes'
	import { tick } from 'svelte'

	export interface Item {
		id: string
		name: string
		resource: string
	}

	let {
		isOpen = $bindable(),
		onSelected,
		items,
		onClose
	}: {
		items: Item[]
		isOpen: boolean
		onSelected: (id: string) => void
		onClose: () => void
	} = $props()

	let selected = $state('')
	let searchValue = $state('')
	let comboboxInput = $state<HTMLInputElement | null>(null)

	// Filter items based on search value
	const filteredItems = $derived(
		searchValue
			? items.filter(item => item.name.toLowerCase().includes(searchValue.toLowerCase()))
			: items
	)

	// Auto-focus input when combobox opens
	$effect(() => {
		;(async () => {
			if (!isOpen || !comboboxInput) return
			await tick()
			comboboxInput?.focus()
		})()
	})

	// Reset search when closing
	$effect(() => {
		if (isOpen) return
		searchValue = ''
	})

	const onSelect = (id: string) => {
		onSelected(id)
		selected = ''
		isOpen = false
		onClose()
	}
</script>

<div>
	<Combobox.Root
		type="single"
		open={isOpen}
		onOpenChange={state => (isOpen = state)}
		allowDeselect={false}
		onValueChange={onSelect}
		bind:value={selected}
	>
		<Combobox.ContentStatic
			class="bg-main-900 border-main-800 max-h-60 w-full overflow-y-auto rounded-t border focus-visible:outline-none"
		>
			{#each filteredItems as item}
				{@const NodeData = nodeTypes.find(nt => nt.type === item.resource.split('/')[0])}
				{@const Icon = NodeData?.icon}

				<Combobox.Item
					value={item.id}
					class={[
						'text-main-400 grid grid-cols-[auto_1fr] items-center gap-2 px-3 py-2 hover:cursor-pointer focus-visible:outline-none',
						'data-highlighted:bg-main-800 data-highlighted:text-main-100',
						'group/item transition'
					]}
				>
					<Icon
						class={[
							'size-5 transition',
							'opacity-75 group-data-highlighted/item:opacity-100',
							NodeData?.iconClasses
						]}
					/>
					{item.name}
				</Combobox.Item>
			{:else}
				<div class="text-center py-4 text-main-400">No nodes available</div>
			{/each}
		</Combobox.ContentStatic>
		<Combobox.Input
			bind:ref={comboboxInput}
			oninput={(e: Event) => {
				const target = e.target as HTMLInputElement
				searchValue = target.value
			}}
			onkeydown={(e: KeyboardEvent) => {
				// if we're pressing backspace when it's empty, close the combobox
				if (e.key === 'Backspace' && searchValue === '') {
					isOpen = false
					onClose()
				}
			}}
			placeholder="Search nodes..."
			class={[
				'bg-main-900 border-main-800 text-main-300 placeholder:text-main-500 w-full rounded-b border border-t-0 px-3 py-2 text-sm',
				'focus-visible:ring-0 focus-visible:outline-none',
				!isOpen && 'hidden'
			]}
			clearOnDeselect={true}
		/>
		{searchValue}
	</Combobox.Root>
</div>
