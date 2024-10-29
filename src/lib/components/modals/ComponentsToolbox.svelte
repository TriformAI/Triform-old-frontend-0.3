<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import filter from '$lib/icons/filter.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import { componentToolsBoxModal, createModuleModal } from '$lib/stores/modals';

	let searchTerm = $state('');
	let pined_unpined = $state(false);
	let categories = $state([
		{
			name: 'Modules',
			collapsed: false,
			children: ['Action X', 'Action Y', 'Action Z']
		},
		{
			name: 'Agents',
			collapsed: false,
			children: ['Agent Alpha', 'Agent Bravo', 'Agent Charlie']
		}
	]);

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	// Function to toggle the collapsed state
	function toggleCategory(index) {
		categories[index].collapsed = !categories[index].collapsed;
	}

	// Filtered categories based on search term
	let filteredCategories = $derived(categories
		.map((category) => {
			const filteredChildren = category.children.filter((child) =>
				child.toLowerCase().includes(searchTerm.toLowerCase())
			);
			return {
				...category,
				children: filteredChildren,
				hasMatch: filteredChildren.length > 0
			};
		})
		.filter((category) => category.hasMatch || searchTerm === ''));
</script>

<div
	class="absolute left-8 top-40 mt-2 w-[27rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Search Modal Header -->
	<div class="flex flex-col px-4 py-4 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Components Toolbox</h3>
			</div>
			{#if pined_unpined}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Pin">
					<img src={pined} alt="pined" class="w-6" />
				</button>
			{:else}
				<button type="button" class="w-6 cursor-pointer" onclick={togglePined} aria-label="Unpin">
					<img src={unpined} alt="unpined" class="w-6" />
				</button>
			{/if}
		</div>
		<div class="flex items-center w-full">
			<div class="relative w-full">
				<input
					id="search"
					type="text"
					placeholder="Search Anything..."
					class="w-full px-4 py-2 text-lg border rounded-md bg-website-secondary border-brand-primary-gray"
					bind:value={searchTerm}
				/>
				<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-3" />
			</div>
			<div class="p-4 ml-3 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={filter} alt="filter" class="w-8" />
			</div>
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-2 overflow-y-auto h-[25rem] bg-website-primary">
		{#each filteredCategories as category, i}
			<div>
				<!-- Category Header -->
				<button
					class="flex items-center justify-between w-full px-6 py-4 cursor-pointer"
					onclick={() => toggleCategory(i)}
				>
					<h3 class="my-1 text-lg font-bold text-white">{category.name}</h3>
					{#if category.collapsed}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="w-5 h-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="w-5 h-5 transform rotate-180"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					{/if}
				</button>

				<!-- Child Items (Visible only if the category is not collapsed) -->
				{#if !category.collapsed}
					{#if category.children.length > 0}
						<div class="w-full">
							{#each category.children as child}
								<div
									class="flex items-center w-full px-6 py-4 duration-200 ease-in-out cursor-pointer group gap-x-3 hover:bg-website-tertiary"
								>
									<!-- Icon that will be hidden initially and shown on hover -->
									<img
										src={modal_title_icon}
										alt="modal_title_icon"
										class="w-6 opacity-0 translate-x-[-20px] transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:translate-x-0"
									/>
									<!-- Text that remains visible -->
									<p
										class="transition-all translate-x-[-33px] duration-200 ease-in-out group-hover:translate-x-0"
									>
										{child}
									</p>
								</div>
							{/each}
						</div>
					{:else}
						<p class="px-6 py-4 text-sm text-brand-light-gray">No results found</p>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
	<!-- Modal Footer -->
	<div
		class="flex items-center justify-center px-6 py-3 border-t gap-x-5 bg-website-primary border-brand-primary-gray"
	>
		<Button
			content={{ icon: Add, text: 'New Action' }}
			on:click={() => {
				componentToolsBoxModal.update((value) => false);
				createModuleModal.update((value) => true);
			}}
		/>
		<Button content={{ icon: Add, text: 'New Agent' }} />
	</div>
</div>
