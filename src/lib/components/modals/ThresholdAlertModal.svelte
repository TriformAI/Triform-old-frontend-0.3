<script>
	import { fade, scale } from 'svelte/transition';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import Button from '$lib/components/Button.svelte';
	import { thresholdModal } from '$lib/stores/modals';

	let upperThreshold = '';
	let lowerThreshold = '';
</script>

<!-- Overlay -->
<div class="fixed inset-0 z-50 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<!-- Modal -->
<div
	class="absolute w-[60rem] top-10 bg-[#0B1544] text-[#D1D5DB] rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between p-6 border-b border-[#FFFFFF1A]">
		<h3 class="text-2xl font-semibold text-left">Threshold Alerts for Metric Name</h3>
		<button
			type="button"
			class="cursor-pointer w-9"
			on:click={() => thresholdModal.update((value) => false)}
		>
			<img src={modal_cross} alt="Close modal" class="w-9" />
		</button>
	</div>

	<!-- Modal Body -->
	<div class="p-6 bg-[#0B1544]">
		<table class="w-full table-auto">
			<thead class="bg-[#0B1544]">
				<tr class="text-left bg-website-tertiary">
					<th class="px-4 py-2 rounded-l-lg text-[#D1D5DB] font-thin">Threshold</th>
					<th class="px-4 py-2 text-[#D1D5DB] font-thin">Color change</th>
					<th class="px-4 py-2 text-[#D1D5DB] font-thin">Additional alert icon</th>
					<th class="px-4 py-2 text-[#D1D5DB] font-thin">Receive notification</th>
					<th class="px-4 py-2 text-[#D1D5DB] font-thin rounded-r-lg">Sound alert</th>
				</tr>
			</thead>
			<tbody>
				<!-- Upper Value Row -->
				<tr class="border-b border-[#FFFFFF1A]">
					<td class="px-4 py-8 pr-8">
						<label for="UpperVal">Upper Value</label>
						<input
							type="text"
							placeholder="Type here..."
							bind:value={upperThreshold}
							class="w-full p-2 mt-2 bg-[#0D1A4D] text-white border border-[#FFFFFF1A] rounded-lg"
						/>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
				</tr>

				<!-- Lower Value Row -->
				<tr class="">
					<td class="px-6 py-8 pr-8">
						<label for="lowerVal">Lower Value</label>
						<input
							type="text"
							placeholder="Type here..."
							bind:value={lowerThreshold}
							class="w-full p-2 mt-2 bg-[#0D1A4D] text-white border border-[#FFFFFF1A] rounded-lg"
						/>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
					<td class="px-6 py-8 pt-14">
						<label class="relative inline-block w-10 align-middle select-none ">
							<input
								type="checkbox"
								class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
							/>
							<span
								class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
							></span>
						</label>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Modal Footer -->
	<div class="flex justify-end p-6 py-3 border-t border-[#FFFFFF1A] bg-website-primary">
		<Button content={{ text: 'Save' }} on:click={() => thresholdModal.update((value) => false)} />
	</div>
</div>

<style>
	.toggle-checkbox {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-checkbox + .toggle-label {
		display: block;
		width: 2.5rem;
		height: 1.5rem;
		background-color: #394167;
		border: 1.5px solid white;
		border-radius: 9999px;
		position: relative;
		cursor: pointer;
		transition: background-color 0.3s ease-in-out;
	}

	.toggle-checkbox + .toggle-label::before {
		content: '';
		display: block;
		width: 1rem;
		height: 1rem;
		background-color: #fff;
		border-radius: 9999px;
		position: absolute;
		top: 0.2rem;
		right: 0.25rem;
		transition: transform 0.3s ease-in-out;
	}

	.toggle-checkbox:checked + .toggle-label {
		background-color: #0b1544;
		border: 1.5px solid #9ca3ae;
	}

	.toggle-checkbox:checked + .toggle-label::before {
		transform: translateX(-1rem);
		background-color: #9ca3ae;
	}
</style>
