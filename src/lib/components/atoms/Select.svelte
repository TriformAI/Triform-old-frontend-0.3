<script lang="ts">
	import { createListbox } from 'svelte-headlessui'
	import Transition from 'svelte-transition'
	import List from './List.svelte'
	import Cancel from '~icons/material-symbols/close-rounded'
	import Check from '~icons/material-symbols/check'
	import DropDown from '~icons/material-symbols/keyboard-arrow-down'

	// Declare bindable props using $props
	let { options = [], selected = $bindable(), singleValue = false } = $props()

	// Create the listbox instance
	const listbox = createListbox({
		label: 'Actions',
		selected: singleValue ? options[0] : []
	})

	// Event handler for selection
	function handleChange(event: CustomEvent) {
		if (singleValue) {
			selected = event.detail
		} else {
			selected = $listbox.selected
		}
	}
</script>

<div class="min-w-80 px-2">
	<div class="relative mt-1 max-w-80">
		<span class="inline-block w-full rounded-md shadow-sm">
			<!-- Button bound to the listbox -->
			<button
				use:listbox.button
				onchange={event => handleChange(event as unknown as CustomEvent)}
				class="focus:shadow-outline-orange relative w-full overflow-auto rounded-md border border-zinc-700 bg-zinc-800 py-2 pr-4 pl-2 text-left text-sm transition duration-150 ease-in-out focus:outline-none sm:leading-5"
			>
				<div class="flex flex-wrap gap-2">
					{#if singleValue}
						<!-- Single select: Display selected item -->
						<span class="flex items-center gap-1 rounded px-2 py-0.5">
							{$listbox.selected.name || 'Select'}
						</span>
					{:else}
						<!-- Multi-select: Display selected items -->
						{#each $listbox.selected as selectedItem (selectedItem.id)}
							<span class="flex items-center gap-1 rounded bg-zinc-600 px-2 py-1 text-xs">
								<span>{selectedItem.name}</span>
								<div use:listbox.deselect={selectedItem} class="cursor-pointer">
									<Cancel />
								</div>
							</span>
						{:else}
							<span class="flex items-center gap-1 px-2 py-0.5 rounded">Select</span>
						{/each}
					{/if}
				</div>
				<span
					class="pointer-events-none absolute inset-y-0 right-0 flex transform items-center transition-transform duration-300 ease-in-out"
				>
					<DropDown />
				</span>
			</button>

			<!-- Dropdown list -->
			<Transition
				show={$listbox.expanded}
				leave="transition ease-linear duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<List>
					{#snippet body()}
						<ul
							use:listbox.items
							class="fixed max-h-60 w-full max-w-[19rem] overflow-auto border-none bg-[#252627] focus:outline-none"
						>
							{#each options as option (option.id)}
								{@const isSelected = singleValue
									? $listbox.selected === option
									: $listbox.selected.includes(option)}
								<li
									class="relative cursor-pointer select-none focus:outline-none"
									use:listbox.item={{ value: option }}
								>
									<span
										class="block truncate {isSelected ? 'font-bold' : 'font-thin text-gray-200'}"
									>
										{option.name}
									</span>
									{#if isSelected}
										<span class="absolute inset-y-0 right-0 flex items-center pr-5">
											<Check />
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/snippet}
				</List>
			</Transition>
		</span>
	</div>
</div>
