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

	let searchTerm = $state('');

	let pined_unpined = $state(false);
	let edit_delete_modal = $state(false);
	let activeIndex = $state(null); // Store the active index for the modal

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	// Function to toggle visibility of a specific variable
	function toggleVisibility(index) {
		variables = variables.map((variable, i) =>
			i === index ? { ...variable, visible: !variable.visible } : variable
		);
	}

	// Handle clicking outside of the DeleteEditModal
	function handleClickOutside(event) {
		if (edit_delete_modal && !event.target.closest('.delete-edit-modal')) {
			edit_delete_modal = false;
			activeIndex = null;
		}
	}

	// Function to toggle the Edit/Delete modal at the specific index
	function toggleEditDeleteModal(index) {
		if (activeIndex === index) {
			activeIndex = null;
			edit_delete_modal = false;
		} else {
			activeIndex = index;
			edit_delete_modal = true;
		}
	}

	let variables = $state([
		{
			key: 'API Token A',
			value: '123456',
			visible: false
		},
		{
			key: 'API Token B',
			value: 'abcde',
			visible: false
		},
		{
			key: 'API Token C',
			value: '123456',
			visible: false
		},
		{
			key: 'API Token D',
			value: 'abcde',
			visible: false
		}
	]);
	// Computed property to filter variables based on searchTerm
	let filteredVariables = $derived(variables.filter((variable) =>
		variable.key.toLowerCase().includes(searchTerm.toLowerCase())
	));
</script>

<a
	href="#token-modal"
	class="absolute z-50 mt-2 border rounded-lg shadow-lg left-8 top-40 w-96 bg-website-secondary text-brand-tertiary-gray border-brand-primary-gray"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
	onclick={handleClickOutside}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-5 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left">API Token</h3>
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
					class="w-full px-4 py-3 text-lg border rounded-md bg-website-secondary border-brand-primary-gray"
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
	<div class="py-3 overflow-y-auto h-[20rem] bg-website-primary">
		{#each filteredVariables as category, i}
			<div
				class={`group flex items-center justify-between w-full duration-200 ease-in-out 
				${activeIndex === i ? 'bg-website-tertiary' : `${!edit_delete_modal && 'hover:bg-website-tertiary'}`}`}
			>
				<button class="flex flex-col w-full px-6 py-4">
					<h3 class="my-1 text-md">{category.key}</h3>
					<!-- {#if category.visible}
						<p>{category.value}</p>
					{:else}
						<p>*******</p>
					{/if} -->
				</button>
				<div
					class={`items-center hidden mr-3 duration-200 ease-in-out ${!edit_delete_modal && 'group-hover:flex'} gap-x-4`}
				>
					<button class="w-5" onclick={() => toggleVisibility(i)} aria-label="Toggle Value">
						{#if category.visible}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
								<path
									fill="#ffffff"
									d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
								/>
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
								<path
									fill="#ffffff"
									d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
								/>
							</svg>
						{/if}
					</button>
					<button
						type="button"
						class="w-5 cursor-pointer"
						onclick={(e) => {
							e.stopPropagation();
							toggleEditDeleteModal(i);
						}}
					>
						<img src={dots} alt="dots" class="w-6" />
					</button>
				</div>

				<!-- Render the DeleteEditModal under the current item -->
				{#if edit_delete_modal && activeIndex === i}
					<DeleteEditModal style="position: absolute; right: 0; top: 100%;" />
				{/if}
			</div>
		{/each}
	</div>

	<!-- Modal Footer -->
	<div class="flex items-center justify-center p-6 border-t bg-website-primary border-brand-primary-gray">
		<Button content={{ width: 'full', icon: Add, text: 'New API' }} />
	</div>
</a>
