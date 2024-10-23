<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import filter from '$lib/icons/filter.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import dots from '$lib/icons/dots.svg';
	import DeleteEditModal from './DeleteEditModal.svelte';

	let pined_unpined = false;
	let activeIndex = null; // Store the active index for the modal

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	let properties = [
		{
			name: 'Property Category A',
			collapsed: false
		},
		{
			name: 'Property Category B',
			collapsed: false
		}
	];

	// Function to toggle the collapsed state
	function toggleCategory(index) {
		properties[index].collapsed = !properties[index].collapsed;
	}
</script>

<button
	class="absolute right-8 top-44 mt-2 w-96 bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex flex-col gap-y-5 py-6 px-4 border-b border-[#FFFFFF1A]">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-2xl font-semibold text-left">Properties</h3>
			</div>
			{#if pined_unpined}
				<button type="button" class="w-6 cursor-pointer" on:click={togglePined} aria-label="Pin">
					<img src={pined} alt="pined" class="w-6" />
				</button>
			{:else}
				<button type="button" class="w-6 cursor-pointer" on:click={togglePined} aria-label="Unpin">
					<img src={unpined} alt="unpined" class="w-6" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-3 overflow-y-auto h-[32rem] bg-website-primary">
		{#each properties as category, i}
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
					<div class="w-full">
						<div class="w-full px-6 py-4 duration-200 ease-in-out cursor-pointer group gap-x-3">
							<div class="w-full mb-4">
								<label for="Label" class="block mb-2 font-medium text-left">Label</label>
								<input
									id="Label"
									type="text"
									placeholder="Type here..."
									class="w-full px-4 py-2 bg-website-secondary border border-[#FFFFFF1A] rounded-md"
								/>
							</div>
							<div class="w-full mb-4">
								<label for="Label" class="block mb-2 font-medium text-left">Label</label>
								<select
									id="Label"
									placeholder="Type here..."
									class="w-full px-4 py-2 bg-website-secondary border border-[#FFFFFF1A] rounded-md"
								>
									<option>Option 1</option>
									<option>Option 2</option>
									<option>Option 3</option>
								</select>
							</div>
							<div class="text-left">
								<input
									type="checkbox"
									class="w-5 h-5 transition-all border rounded shadow appearance-none cursor-pointer  hover:shadow-md border-[#ffffff65] checked:bg-slate-50 checked:border-slate-800"
									id="check"
								/>
								<label for="check" class="relative ml-3 text-white bottom-1">Label</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</button>
