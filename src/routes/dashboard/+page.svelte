<script>
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import { canvasToolsModal, toggleModal } from '../../stores/modals';
	import { iconsStore, toggleIconVisibility } from '../../stores/tools';

	import green_plus from '$lib/icons/green_add.svg';

	let createModuleModal = false;
	let environmentVariables = ['Variable 1', 'Variable 2', 'Variable 3'];

	const toggleCreateModuleModal = () => {
		createModuleModal = !createModuleModal;
	};

	/**
	 * @type {{ id: number; icon: string; alt: string; visibleOnToolbar: boolean; }[]}
	 */
	let moreIcons;
	iconsStore.subscribe((value) => {
		moreIcons = value.filter((icon) => !icon.visibleOnToolbar);
	});
</script>

<section
	class="flex flex-col justify-between bg-[#091136] text-brand-white min-h-[calc(100vh-15rem)]"
>
	<div class="flex flex-col items-center justify-center max-w-xl mx-auto my-auto text-center">
		{#if $canvasToolsModal}
			<div
				class="absolute w-[60rem] mx-auto bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
				in:scale={{ start: 0.9, duration: 200 }}
				out:fade={{ duration: 150 }}
			>
				<!-- Modal Header -->
				<div class="flex items-center justify-between p-6 border-b border-[#FFFFFF1A]">
					<div class="flex items-center gap-x-3">
						<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
						<h3 class="text-2xl font-semibold text-left">Available tools in the More Menu</h3>
					</div>
					<button
						type="button"
						class="cursor-pointer w-9"
						on:click={() => canvasToolsModal.update((value) => false)}
					>
						<img src={modal_cross} alt="Close modal" class="w-9" />
					</button>
				</div>

				<!-- Modal Body -->
				<div class="bg-[#0B1544] rounded-b-lg flex items-center flex-wrap gap-5 p-10">
					{#each moreIcons as { id, icon, alt }}
						<button
							class="relative p-2 cursor-pointer bg-website-tertiary rounded-xl"
							on:click={() => toggleIconVisibility(id)}
						>
							<img {alt} src={icon} class="w-8" />
							<div class="absolute inset-y-0 right-0 top-10">
								<img src={green_plus} alt="add" class="w-5" />
							</div>
						</button>
					{/each}
				</div>

				<!-- Modal Footer -->
				<div class="flex justify-end p-6 py-3 border-t border-[#FFFFFF1A]">
					<Button
						content={{ text: 'Done' }}
						on:click={() => canvasToolsModal.update((value) => false)}
					/>
				</div>
			</div>
		{/if}
		{#if createModuleModal}
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
													class="w-5 h-5 transition-all border rounded shadow appearance-none cursor-pointer peer hover:shadow-md border-[#FFFFFF1A] checked:bg-slate-50 checked:border-slate-800"
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
		{/if}
		<h2 class="text-2xl text-[#9CA3AF] leading-normal">
			Right-click to Create Module/Agent/API or Drag from Toolbox
		</h2>
		<div class="relative flex items-center justify-center gap-x-3 top-64">
			<Button content={{ icon: Add, text: 'New Module' }} on:click={toggleCreateModuleModal} />
			<Button content={{ icon: Add, text: 'New API' }} />
			<Button content={{ icon: Add, text: 'New Agent' }} />
		</div>
	</div>
</section>
