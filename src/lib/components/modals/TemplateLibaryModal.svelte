<!-- @migration-task Error while migrating Svelte code: `<button>` is invalid inside `<button>` -->
<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Add from '$lib/icons/add.svg';
	import { templateLibraryModal, templateModal } from '$lib/stores/modals';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';
	import { templateStore, templateLoaded, templateID } from '$lib/stores/template';
	import { get } from 'svelte/store';

	let apiUrl = PUBLIC_API_URL;
	let authToken = getAuthToken();
	let loading = false;

	let searchTerm = '';

	let pined_unpined = false;

	function togglePined() {
		pined_unpined = !pined_unpined;
	}

	onMount(() => {
		fetchTemplates();
	});

	async function fetchTemplates() {
		if (get(templateLoaded)) return; // Skip fetching if templates are already loaded

		try {
			loading = true;
			const response = await fetch(`${apiUrl}/api/v1/templates`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});
			const data = await response.json();
			loading = false;
			templateStore.set(data.data); // Save data to the store
			templateLoaded.set(true); // Mark templates as loaded
		} catch (error) {
			loading = false;
			console.error('Error fetching templates:', error);
		}
	}

	// Computed property to filter variables based on searchTerm
	$: filteredTemplates = $templateStore.filter((template) =>
		template.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const toggleTemplateModal = () => {
		// set the template id
		templateLibraryModal.update((value) => false);
		templateModal.update((value) => !value);
	};
</script>

<div
	class="absolute left-8 top-44 mt-2 w-[38rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-5 gap-y-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Templates Library</h3>
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
					placeholder="Search..."
					class="w-full px-4 py-2.5 text-md border rounded-md bg-website-secondary border-brand-primary-gray"
					bind:value={searchTerm}
				/>
				<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-5 right-3 top-3" />
			</div>
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="py-4 overflow-y-auto h-[25rem] bg-website-primary">
		{#each filteredTemplates as category, i}
			<div
				class={`group flex items-center justify-between w-full duration-200 ease-in-out hover:bg-website-tertiary border-y border-y-brand-primary-gray`}
			>
				<div class="flex flex-col w-full px-6 py-3 overflow-hidden">
					<div class="flex items-center justify-between w-full">
						<div>
							<h3 class="my-1 text-sm font-bold text-left text-white">{category.name}</h3>
							<div class="flex items-center w-full gap-2">
								{#each category.tagsAssigned && category.tagsAssigned.split(', ') as tag}
									<span
										class="px-2 py-1 text-xs border rounded-md text-brand-light-gray bg-website-secondary border-white/10 hover:border-white/30"
										>{tag}</span
									>
								{/each}
							</div>
						</div>
						<div
							class="items-center flex-shrink-0 hidden duration-200 ease-in-out group-hover:flex gap-x-5"
						>
							<div class="flex items-center gap-x-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 576 512"
									width="20"
									height="20"
								>
									<path
										fill="#ffffff"
										d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
									/>
								</svg>
								<a
									href={`?TID=${category.id}`}
									onclick={() => {
										templateID.set(category.id);
										toggleTemplateModal();
									}}
									class="text-xs hover:text-white">View Details</a
								>
							</div>
							<button
								class={`flex items-center justify-center flex-shrink-0 gap-x-3 p-2 text-xs text-md font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-primary-gray hover:border-white`}
							>
								<img src={Add} alt="Add_Icon" class="w-4" />
								<span>Use Template</span>
							</button>
						</div>
					</div>

					<p class="mt-2 text-xs text-left text-brand-light-gray max-w-[40em] truncate-description">
						{category.description}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.truncate-description {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
