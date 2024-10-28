<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import filter from '$lib/icons/filter.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';

	let searchTerm = '';

	let pined_unpined = false;
	let activeIndex = null; // Store the active index for the modal

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	let containers = [
		{
			name: 'Disk Name A',
			id: '123456',
			date: '01/01/24',
			active: true
		},
		{
			name: 'Disk Name B',
			id: 'abcde',
			date: '01/01/24',
			active: true
		},
		{
			name: 'Disk Name C',
			id: '123456',
			date: '01/01/24',
			active: false
		},
		{
			name: 'Disk Name D',
			id: 'abcde',
			date: '01/01/24',
			active: false
		}
	];
	// Computed property to filter variables based on searchTerm
	$: filteredContainers = containers.filter((variable) =>
		variable.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
</script>

<button
	class="absolute left-8 top-44 mt-2 w-[30rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-6 gap-y-5 ">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-2xl font-semibold text-left">Storage Management</h3>
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
		<div class="flex items-center w-full">
			<div class="relative w-full">
				<input
					id="search"
					type="text"
					placeholder="Search Anything..."
					class="w-full px-4 py-4 text-xl border rounded-md bg-website-secondary border-brand-primary-gray"
					bind:value={searchTerm}
				/>
				<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-6 right-3 top-5" />
			</div>
			<div class="p-4 ml-3 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={filter} alt="filter" class="w-8" />
			</div>
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class=" overflow-y-auto h-[32rem] bg-website-primary">
		{#each filteredContainers as category, i}
			<div
				class={`py-3 px-5 group flex items-center justify-between w-full duration-200 ease-in-out hover:bg-website-tertiary border-y border-y-brand-primary-gray`}
			>
				<button class="flex flex-col w-full py-4">
					<h3 class="my-1 text-xl font-bold text-white">{category.name}</h3>
					<div class="flex items-center my-1 gap-x-5 text-brand-light-gray">
						<h3 class="text-lg">{category.date}</h3>
						<p>.</p>
						<h3 class="text-lg">{category.id}</h3>
					</div>
					{#if category.active}
						<p class="text-primary-green">Active</p>
					{:else}
						<p class="text-primary-red">Inactive</p>
					{/if}
				</button>
				<Button content={{ text: 'Attach' }} />
			</div>
		{/each}
	</div>

	<!-- Modal Footer -->
	<div class="flex items-center justify-center p-6 bg-website-primary ">
		<Button content={{ width: 'full', icon: Add, text: 'New Storage' }} />
	</div>
</button>
