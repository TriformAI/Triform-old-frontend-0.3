<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	let searchTerm = '';
	let categories = [
		{
			name: 'Agents',
			collapsed: false,
			children: ['Agent Alpha', 'Agent Bravo', 'Agent Charlie']
		},
		{
			name: 'Modules',
			collapsed: false,
			children: ['Module X', 'Module Y', 'Module Z']
		},
		{
			name: 'Variables',
			collapsed: false,
			children: ['Variable A', 'Variable B', 'Variable C']
		}
	];

	// Function to toggle the collapsed state
	function toggleCategory(index) {
		categories[index].collapsed = !categories[index].collapsed;
	}

	// Filtered categories based on search term
	$: filteredCategories = categories
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
		.filter((category) => category.hasMatch || searchTerm === '');
</script>

<div
	class="absolute right-8 top-44 mt-2 w-96 bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Search Modal Header -->
	<div class="flex flex-col gap-y-5 py-6 px-4 border-b border-[#FFFFFF1A]">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-2xl font-semibold text-left">Search</h3>
		</div>
		<div class="relative">
			<input
				id="search"
				type="text"
				placeholder="Search Anything..."
				class="w-full px-4 py-4 text-xl bg-website-secondary border border-[#FFFFFF1A] rounded-md"
				bind:value={searchTerm}
			/>
			<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-5" />
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-3 overflow-y-auto h-[35rem]">
		{#each filteredCategories as category, i}
			<div>
				<!-- Category Header -->
				<button
					class="flex items-center justify-between w-full px-6 py-4 cursor-pointer"
					on:click={() => toggleCategory(i)}
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
						<p class="px-6 py-4 text-sm text-[#9CA3AF]">No results found</p>
					{/if}
				{/if}

				<hr class="border-t-[#FFFFFF1A] mt-3" />
			</div>
		{/each}
	</div>
</div>
