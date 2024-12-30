<script lang="ts">
	import { scale } from 'svelte/transition'
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import modal_cross from '$lib/icons/modal_cross.svg'
	import search_icon from '$lib/icons/search.svg'

	let searchTerm = $state('')

	let { toggleAttachTemplateModal, toggleCreateModuleModal, toggleAttachComponentModal } = $props()

	let components = $state([
		{
			name: 'Component A',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component B',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component C',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component D',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component E',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component F',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component G',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		},
		{
			name: 'Component H',
			description:
				'Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur. Lorem ipsum dolor sit amet consectur.',

			selected: false
		}
	])

	// Track selection for "Start with a Blank Action"
	let isBlankActionSelected = $state(false)

	// Computed property to filter variables based on searchTerm
	let filteredComponent = $derived(
		components.filter(template => template.name.toLowerCase().includes(searchTerm.toLowerCase()))
	)
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="relative flex items-center justify-center">
	<div
		class="w-[60rem] mx-auto bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">New Action</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleAttachComponentModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="rounded-b-lg bg-website-primary">
			<div class="p-4 space-y-5">
				<div class="px-3">
					<button
						class={`${isBlankActionSelected && 'bg-website-tertiary border-white'} w-full p-4 text-md text-center duration-100 ease-linear border rounded-lg cursor-pointer border-brand-primary-gray hover:bg-website-tertiary`}
						onclick={toggleCreateModuleModal}
					>
						<h3 class="mb-1 font-bold">Start From Scratch</h3>
						<p class="font-thin">No pre-filled settings, providing a clean slate.</p>
					</button>
				</div>

				<!-- Search and Filter -->
				<div class="flex items-center w-1/2 px-3 mr-auto">
					<div class="relative w-full">
						<input
							id="search"
							type="text"
							placeholder="Search..."
							class="w-full px-4 py-3 bg-transparent border rounded-md text-md border-brand-primary-gray"
							bind:value={searchTerm}
						/>
						<img src={search_icon} alt="search_icon" class="absolute inset-y-0 w-5 right-3 top-4" />
					</div>
				</div>

				<div class="py-5 px-3 grid grid-cols-2 gap-5 place-items-center h-[20rem] overflow-y-auto">
					{#if filteredComponent.length === 0}
						<div class="col-span-3 text-center text-brand-light-gray">
							No Templates found with provided search query
						</div>
					{:else}
						{#each filteredComponent as template}
							<button
								class={`${template.selected ? 'bg-website-tertiary border-white' : 'bg-website-tertiary border-brand-primary-gray hover:border-brand-tertiary-gray'} flex items-center justify-between w-full duration-200 ease-in-out border rounded-lg cursor-pointer group`}
								onclick={toggleAttachTemplateModal}
							>
								<div class="flex flex-col w-full px-6 py-3 overflow-hidden">
									<div class="flex items-center justify-between w-full">
										<div>
											<h3 class="my-1 font-bold text-left text-white text-md">{template.name}</h3>
										</div>
									</div>
									<p class="text-xs text-left text-brand-light-gray truncate-description">
										{template.description}
									</p>
								</div>
							</button>
						{/each}
					{/if}
				</div>
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
