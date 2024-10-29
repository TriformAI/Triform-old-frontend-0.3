<script>
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';

	let { toggleCreateModuleModal, toggleAttachTemplateModal } = $props();

	let environmentVariables = ['Variable 1', 'Variable 2', 'Variable 3', 'Variable 4', 'Variable 5'];
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div
	class="absolute w-[85rem] mx-auto bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between p-6 border-b border-brand-primary-gray">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-xl font-semibold text-left">New Action</h3>
		</div>
		<button type="button" class="cursor-pointer w-9" onclick={toggleCreateModuleModal}>
			<img src={modal_cross} alt="Close modal" class="w-9" />
		</button>
	</div>

	<!-- Modal Body -->
	<div class="rounded-b-lg bg-website-primary">
		<form class="grid grid-cols-2 gap-6 px-6 py-12 text-left divide-x-2 divide-brand-primary-gray">
			<!-- Left Column -->
			<div class="p-4">
				<!-- Name Input -->
				<div class="mb-4">
					<label for="name" class="block mb-2 text-lg font-medium">Name</label>
					<input
						id="name"
						type="text"
						placeholder="Type here..."
						class="w-full px-4 py-3 text-lg bg-transparent border rounded-md border-brand-primary-gray"
					/>
				</div>

				<!-- Description Input -->
				<div class="mb-4">
					<label for="description" class="block mb-2 text-lg font-medium">Description</label>
					<textarea
						id="description"
						placeholder="Type here..."
						class="w-full h-32 px-4 py-3 text-lg bg-transparent border rounded-md border-brand-primary-gray max-h-52 min-h-14"
					></textarea>
				</div>

				<!-- Tags Input -->
				<div class="mb-4">
					<label for="tags" class="block mb-2 text-lg font-medium">Tags</label>
					<input
						id="tags"
						type="text"
						placeholder="Type here..."
						class="w-full px-4 py-3 text-lg bg-transparent border rounded-md border-brand-primary-gray"
					/>
				</div>
			</div>

			<!-- Right Column - Environment Variables -->
			<div class="p-4 pl-10">
				<label for="env-search" class="block mb-2 text-lg font-medium">
					Link Environment Variables (optional)
				</label>
				<div class="h-full rounded-md bg-website-primary">
					<input
						id="env-search"
						type="text"
						placeholder="Search..."
						class="w-full px-4 py-3 mb-4 text-lg bg-transparent border rounded-md border-brand-primary-gray"
					/>
					<div class="flex flex-col gap-2">
						<!-- Checkboxes for environment variables -->
						{#each environmentVariables as variable}
							<div class="inline-flex items-center gap-x-4">
								<label class="relative flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="w-5 h-5 transition-all border rounded shadow appearance-none cursor-pointer peer hover:shadow-md border-brand-secondary-gray checked:bg-slate-50 checked:border-slate-800"
										id="check"
									/>
									<span
										class="absolute text-black transform -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none peer-checked:opacity-100 top-1/2 left-1/2"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-3.5 w-3.5"
											viewBox="0 0 20 20"
											fill="currentColor"
											stroke="currentColor"
											stroke-width="1"
										>
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											></path>
										</svg>
									</span>
								</label>
								<span class="text-lg text-brand-light-gray">{variable}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</form>

		<!-- Modal Footer -->
		<div class="flex justify-end p-6 border-t border-brand-primary-gray">
			<Button content={{ text: 'Next' }} on:click={toggleAttachTemplateModal} />
		</div>
	</div>
</div>
