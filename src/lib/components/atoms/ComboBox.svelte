<script lang="ts">
	import { Combobox } from 'bits-ui'
	import IconCheck from '~icons/mdi/check'
	import IconChevronDoubleUp from '~icons/mdi/chevron-double-up'
	import IconChevronDoubleDown from '~icons/mdi/chevron-double-down'
	import IconReset from '~icons/mdi/close-circle-outline'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import { tick } from 'svelte'

	let {
		value = $bindable(),
		searchValue = $bindable(''),
		items,
		createNew,
		placeholder,
		target
	}: {
		value: string
		searchValue?: string
		placeholder?: string
		items: {
			value: string
			label: string
		}[]
		createNew?: {
			label: string
			trigger: () => void
		}
		target?: HTMLElement
	} = $props()

	const filteredItems = $derived.by(() => {
		const filteredItems =
			searchValue === ''
				? items
				: items.filter(item => item.label.toLowerCase().includes(searchValue.toLowerCase()))

		if (createNew) {
			return [{ value: 'new', label: createNew.label }, ...filteredItems]
		}

		return filteredItems
	})

	let input = $state<HTMLInputElement | null>(null)
	let showItems = $state(false)
</script>

<Combobox.Root
	open={showItems}
	bind:value
	type="single"
	onValueChange={async newVal => {
		if (newVal === 'new') {
			createNew?.trigger()
			await tick()
			showItems = false
			searchValue = ''
			value = ''
		}
	}}
	onOpenChange={o => {
		if (!o) searchValue = ''
	}}
>
	<div class="relative">
		<Combobox.Input
			onclick={() => {
				showItems = true
			}}
			onblur={() => {
				showItems = false
			}}
			bind:ref={input}
			clearOnDeselect={true}
			disabled={!!value}
			oninput={e => {
				searchValue = e.currentTarget.value
			}}
			class="input-text"
			{placeholder}
			aria-label={placeholder}
		/>
		<div class="absolute end-3 top-1/2 -translate-y-1/2 leading-0">
			{#if value}
				<button
					type="button"
					onclick={async () => {
						value = ''
						searchValue = ''
						await tick()
						input?.focus()
					}}
				>
					<IconReset class="text-main-300 size-5" />
				</button>
			{:else}
				<Combobox.Trigger>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 256 256"
						class=" text-main-300 size-4"
					>
						<rect width="256" height="256" fill="none"></rect>
						<path
							d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"
						>
						</path>
					</svg>
				</Combobox.Trigger>
			{/if}
		</div>
	</div>
	<Combobox.Portal to={target}>
		<Combobox.Content
			class={[
				'focus-override',
				'border-main-700 bg-main-800 rounded-md border p-1',
				'z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)]',
				'outline-hidden select-none',
				'data-[state=open]:animate-in data-[state=closed]:animate-out',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
				'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
				'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
			]}
			sideOffset={10}
		>
			<Combobox.ScrollUpButton class="flex w-full items-center justify-center py-1">
				<IconChevronDoubleUp class="size-3" />
			</Combobox.ScrollUpButton>

			<Combobox.Viewport>
				{#each filteredItems as item, _i (item.value)}
					<Combobox.Item
						class="rounded-button data-highlighted:bg-main-850 flex h-10 w-full items-center py-3 pr-1.5 pl-5 text-sm outline-hidden select-none hover:cursor-pointer data-highlighted:rounded"
						value={item.value}
						label={item.label}
					>
						{#snippet children({ selected })}
							{#if item.value === 'new'}
								<IconAdd class="text-accent-300 me-2 size-5" />
							{/if}
							<span class={[item.value === 'new' && 'text-accent-300']}>
								{item.label}
							</span>
							{#if selected}
								<div class="ml-auto">
									<IconCheck />
								</div>
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span class="block px-5 py-2 text-sm text-main-400"> No results found, try again. </span>
				{/each}
			</Combobox.Viewport>

			<Combobox.ScrollDownButton class="flex w-full items-center justify-center py-1">
				<IconChevronDoubleDown class="size-3" />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
