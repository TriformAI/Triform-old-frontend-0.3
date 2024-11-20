<script>
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import search_icon from '$lib/icons/search.svg';
	import filter from '$lib/icons/filter.svg';
	import { onMount } from 'svelte';

	let searchTerm = $state('');

	let { toggleAttachTemplateModal, toggleCreateModuleModal, toggleModuleInfoModal } = $props();

	let templates = $state([
		{
			name: 'Template A',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',
			tags: ['tag1', 'tag2', 'tag3'],
			selected: false
		},
		{
			name: 'Template B',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',
			tags: ['tag1', 'tag2', 'tag3'],
			selected: false
		},
		{
			name: 'Template C',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',
			tags: ['tag1', 'tag2', 'tag3'],
			selected: false
		},
		{
			name: 'Template D',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',
			tags: ['tag1', 'tag2', 'tag3'],
			selected: false
		}
	]);

	// Track selection for "Start with a Blank Action"
	let isBlankActionSelected = $state(false);

	function selectTemplate(selectedTemplate) {
		// Deselect all templates and the "Blank Action" option
		templates = templates.map((template) => {
			return { ...template, selected: template === selectedTemplate };
		});
		isBlankActionSelected = false;
	}

	function selectBlankAction() {
		// Deselect all templates
		templates.forEach((template) => (template.selected = false));
		templates = templates.map((template) => {
			return { ...template, selected: false };
		});
		// Select the "Blank Action" option
		isBlankActionSelected = true;
	}

	// Computed property to filter variables based on searchTerm
	let filteredTemplates = $derived(
		templates.filter((template) => template.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	onMount(() => {
		document.body.style.overflow = 'hidden'; // Disable scrolling
	});

</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="flex items-center justify-center">
	<div
		class=" w-[60rem] right-64 mx-auto bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">New Action</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleAttachTemplateModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="rounded-b-lg bg-website-primary">
			<div class="p-4 space-y-5">
				<!-- Blank Action Button -->
				<button
					class={`${isBlankActionSelected && 'bg-website-tertiary border-white'} w-full p-4 text-md text-center duration-100 ease-linear border rounded-lg cursor-pointer border-brand-primary-gray hover:bg-website-tertiary`}
					onclick={selectBlankAction}
				>
					<h3 class="mb-1 font-bold">Start with a Blank Action</h3>
					<p class="font-thin">No pre-filled code, providing a clean slate.</p>
				</button>

				<!-- Search and Filter -->
				<div class="flex items-center justify-end w-1/2 ml-auto">
					<div class="relative w-full">
						<input
							id="search"
							type="text"
							placeholder="Search Anything..."
							class="w-full px-4 py-3 bg-transparent border rounded-md text-md border-brand-primary-gray"
							bind:value={searchTerm}
						/>
						<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-5 right-3 top-4" />
					</div>
					
				</div>

				<!-- Template Selection -->
				<div class="flex items-center w-full px-3 gap-x-3">
					<h3 class="flex-shrink-0 font-bold text-md">Your previously created actions</h3>
					<div class="w-full border-t border-brand-primary-gray"></div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="3"
						stroke="white"
						class="w-5 h-5 transform rotate-180"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
				<div class="grid grid-cols-3 gap-5 place-items-center h-[15rem] overflow-y-auto px-3">
					{#if filteredTemplates.length === 0}
						<div class="col-span-3 text-center text-brand-light-gray">
							No Templates found with provided search query
						</div>
					{:else}
						{#each filteredTemplates as template}
							<button
								class={`${template.selected ? 'bg-website-tertiary border-white' : 'hover:bg-website-tertiary border-brand-primary-gray'} flex items-center justify-between w-full duration-200 ease-in-out border rounded-lg cursor-pointer group`}
								onclick={() => selectTemplate(template)}
							>
								<div class="flex flex-col w-full px-6 py-2 overflow-hidden">
									<div class="flex items-center justify-between w-full">
										<div>
											<h3 class="my-1 font-bold text-left text-white text-md">{template.name}</h3>
											<div class="flex items-center w-full gap-2 mb-1">
												{#each template.tags as tag}
													<span
														class="px-2 py-1 text-xs border rounded-md text-brand-light-gray bg-website-secondary border-white/10 hover:border-white/30"
														>{tag}</span
													>
												{/each}
											</div>
										</div>
									</div>
									<p class="mt-2 text-xs text-left text-brand-light-gray truncate-description">
										{template.description}
									</p>
								</div>
							</button>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Modal Footer -->
			<div class="flex justify-between w-full p-3 border-t border-brand-primary-gray">
				<Button content={{ text: 'Back' }} on:click={toggleCreateModuleModal} />
				<Button content={{ text: 'Create' }} on:click={toggleModuleInfoModal} />
			</div>
		</div>
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
