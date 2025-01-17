<script lang="ts">
	import { createListbox } from 'svelte-headlessui'
	import Transition from 'svelte-transition'
	import List from './List.svelte'

	// Declare bindable props using $props
	let { options, selected = $bindable() } = $props()

	// Create the listbox instance, binding `selected` for two-way updates
	const listbox = createListbox({ label: 'Actions', selected })
</script>

<div class="z-20 w-full max-w-4xl px-2">
	<div class="relative mt-1">
		<span class="inline-block w-full rounded-md shadow-sm">
			<!-- Button bound to the listbox -->
			<button
				use:listbox.button
				onchange={() => {
					//update the selected value
					selected = $listbox.selected
				}}
				class="relative w-full py-2 pl-2 pr-10 text-sm text-left transition duration-150 ease-in-out border rounded-md cursor-default border-zinc-700 bg-zinc-800 focus:shadow-outline-orange focus:outline-none sm:leading-5"
			>
				<div class="flex flex-wrap gap-2">
					<!-- Display selected items -->
					{#each $listbox.selected as selectedItem (selectedItem.id)}
						<span class="flex items-center gap-1 rounded bg-zinc-600 px-4 py-0.5">
							<span>{selectedItem.name}</span>
							<div use:listbox.deselect={selectedItem} class="cursor-pointer">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
									/>
								</svg>
							</div>
						</span>
					{:else}
						<span class="flex items-center gap-1 rounded px-2 py-0.5">Select</span>
					{/each}
				</div>
				<span
					class="absolute inset-y-0 right-0 flex items-center transition-transform duration-200 ease-in-out transform pointer-events-none"
					class:rotate-180={$listbox.expanded}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"
						/>
					</svg>
				</span>
			</button>

			<!-- Dropdown list -->
			<Transition
				show={$listbox.expanded}
				leave="transition ease-in duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<List>
					{#snippet body()}
						<ul
							use:listbox.items
							class="absolute w-full py-1 mt-1 overflow-auto text-sm text-white border rounded-md shadow-lg bg-zinc-900 border-zinc-700 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none"
						>
							{#each options as option (option.id)}
								{@const active = $listbox.active === option}
								{@const isSelected = $listbox.selected.includes(option)}
								<li
									class="relative cursor-default select-none py-2 pl-4 pr-9 focus:outline-none {active
										? 'bg-zinc-500 text-white'
										: 'text-gray-300'}"
									use:listbox.item={{ value: option }}
								>
									<span
										class="block truncate {isSelected ? 'font-bold text-white' : 'font-normal'}"
									>
										{option.name}
									</span>
									{#if isSelected}
										<span class="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="1.5em"
												height="1.5em"
												viewBox="0 0 24 24"
											>
												<path
													fill="currentColor"
													d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"
												/>
											</svg>
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
