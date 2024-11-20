<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';

	let searchTerm = $state('');
	let pined_unpined = $state(false);
	let categories = $state([
		{
			name: 'Agents',
			collapsed: false,
			children: ['Agent Alpha', 'Agent Bravo', 'Agent Charlie']
		},
		{
			name: 'Modules',
			collapsed: false,
			children: ['Action X', 'Action Y', 'Action Z']
		},
		{
			name: 'Variables',
			collapsed: false,
			children: ['Variable A', 'Variable B', 'Variable C']
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
	class="absolute z-50 mt-2 border rounded-lg shadow-lg right-8 top-40 w-96 bg-website-secondary text-brand-tertiary-gray border-brand-primary-gray"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Search Modal Header -->
	<div class="flex flex-col px-4 py-5 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-md font-semibold text-left text-white">Search</h3>
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
		<div class="relative">
			<input
				id="search"
				type="text"
				placeholder="Search Anything..."
				class="w-full px-4 py-3 border rounded-md text-md bg-website-secondary border-brand-primary-gray"
				bind:value={searchTerm}
			/>
			<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-3" />
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-3 overflow-y-auto h-[25rem] bg-website-primary">
		{#each filteredCategories as category, i}
			<div>
				<!-- Category Header -->
				<button
					class="flex items-center justify-between w-full px-6 py-4 cursor-pointer"
					onclick={() => toggleCategory(i)}
				>
					<h3 class="my-1 font-bold text-white text-md">{category.name}</h3>
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

				<hr class="mt-3 border-t-brand-primary-gray" />
			</div>
		{/each}
	</div>
</div>
