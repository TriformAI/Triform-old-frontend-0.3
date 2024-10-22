<script>
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';

	export let createModuleModal;

	export let toggleCreateModuleModal;

	let environmentVariables = ['Variable 1', 'Variable 2', 'Variable 3'];
    
</script>

<div
	class="absolute w-[60rem] mx-auto bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between p-6 border-b border-[#FFFFFF1A]">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-2xl font-semibold text-left">New Module</h3>
		</div>
		<button type="button" class="cursor-pointer w-9" on:click={toggleCreateModuleModal}>
			<img src={modal_cross} alt="Close modal" class="w-9" />
		</button>
	</div>

	<!-- Modal Body -->
	<div class="bg-[#0B1544] rounded-b-lg">
		<form class="grid grid-cols-2 gap-6 px-6 py-12 text-left divide-x-2 divide-[#FFFFFF1A]">
			<!-- Left Column -->
			<div class="p-4">
				<!-- Name Input -->
				<div class="mb-4">
					<label for="name" class="block mb-2 font-medium">Name</label>
					<input
						id="name"
						type="text"
						placeholder="Type here..."
						class="w-full px-4 py-2 bg-website-secondary border border-[#FFFFFF1A] rounded-md"
					/>
				</div>

				<!-- Description Input -->
				<div class="mb-4">
					<label for="description" class="block mb-2 font-medium">Description</label>
					<textarea
						id="description"
						placeholder="Type here..."
						class="w-full px-4 py-2 bg-website-secondary border border-[#FFFFFF1A] rounded-md h-32"
					></textarea>
				</div>

				<!-- Tags Input -->
				<div class="mb-4">
					<label for="tags" class="block mb-2 font-medium">Tags</label>
					<input
						id="tags"
						type="text"
						placeholder="Type here..."
						class="w-full px-4 py-2 bg-website-secondary border border-[#FFFFFF1A] rounded-md"
					/>
				</div>
			</div>

			<!-- Right Column - Environment Variables -->
			<div class="p-4 pl-10">
				<label for="env-search" class="block mb-2 font-medium">
					Link Environment Variables (optional)
				</label>
				<div class="rounded-md bg-[#0B1544] h-full">
					<input
						id="env-search"
						type="text"
						placeholder="Search..."
						class="w-full px-4 py-2 mb-4 bg-website-secondary border border-[#FFFFFF1A] rounded-md"
					/>
					<div class="flex flex-col gap-2">
						<!-- Checkboxes for environment variables -->
						{#each environmentVariables as variable}
							<div class="inline-flex items-center gap-x-4">
								<label class="relative flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="w-5 h-5 transition-all border rounded shadow appearance-none cursor-pointer peer hover:shadow-md border-[#ffffff65] checked:bg-slate-50 checked:border-slate-800"
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
								<span class="text-[#D1D5DB]">{variable}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</form>

		<!-- Modal Footer -->
		<div class="flex justify-end p-6 border-t border-[#FFFFFF1A]">
			<Button content={{ text: 'Next' }} />
		</div>
	</div>
</div>
