<script>
	import { fade, scale } from 'svelte/transition';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import Button from '$lib/components/Button.svelte';
	import { statusModal, thresholdModal } from '$lib/stores/modals';
	import bell_icon from '$lib/icons/bell_icon.svg';

	let metrics = $state([
		{
			name: 'Triform Status',
			collapsedView: true,
			expandedView: false,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'Runs per Hour',
			collapsedView: true,
			expandedView: true,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'Errors per Hour',
			collapsedView: true,
			expandedView: true,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'Alerts',
			collapsedView: true,
			expandedView: true,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'CPU Usage',
			collapsedView: true,
			expandedView: false,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'API Call Success Rate',
			collapsedView: true,
			expandedView: true,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		},
		{
			name: 'Average Response Time',
			collapsedView: true,
			expandedView: true,
			graphType: 'Line',
			timeInterval: 'Real-time',
			dataAggregation: 'Average',
			group: 'None'
		}
	]);
</script>

<div class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-lg"></div>
<div class="flex items-center justify-center">
	<div
		class={`${$thresholdModal && 'opacity-30'} absolute w-[80%] bg-website-secondary top-20 text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50`}
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
				<h3 class="pl-3 font-semibold text-left text-white text-md">Available Metrics</h3>
			<button
				type="button"
				class="cursor-pointer w-9"
				onclick={() => statusModal.update((value) => false)}
			>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="px-2 py-3 rounded-b-lg bg-website-primary">
			<div class="p-3 overflow-y-auto max-h-72">
				<table class="w-full">
					<thead class="sticky top-0 z-10 bg-website-primary">
						<tr class="text-left bg-website-tertiary">
							<th class="px-4 py-2 font-thin rounded-l-lg text-brand-tertiary-gray">Metric</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Collapsed View</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Expanded View</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Graph Type</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Time Interval</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Data Aggregation</th>
							<th class="px-4 py-2 font-thin text-brand-tertiary-gray">Group</th>
							<th class="px-4 py-2 font-thin rounded-r-lg text-brand-tertiary-gray"></th>
						</tr>
					</thead>
					<tbody>
						{#each metrics as metric}
							<tr>
								<td class="p-4">{metric.name}</td>
								<td class="p-4">
									<label class="relative inline-block w-10 mr-2 align-middle select-none right-1.5">
										<input
											type="checkbox"
											class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
										/>
										<span
											class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
										></span>
									</label>
								</td>
								<td class="p-4">
									<label class="relative inline-block w-10 mr-2 align-middle select-none right-1.5">
										<input
											type="checkbox"
											class="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox"
										/>
										<span
											class="block h-6 overflow-hidden bg-gray-600 rounded-full cursor-pointer toggle-label"
										></span>
									</label>
								</td>
								<td class="p-4">
									<select bind:value={metric.graphType} class="p-2 bg-transparent">
										<option>Line</option>
										<option>Bar</option>
										<option>Pie</option>
									</select>
								</td>
								<td class="p-4">
									<select bind:value={metric.timeInterval} class="p-2 bg-transparent">
										<option>Real-time</option>
										<option>Hourly</option>
										<option>Daily</option>
									</select>
								</td>
								<td class="p-4">
									<select bind:value={metric.dataAggregation} class="p-2 bg-transparent">
										<option>Average</option>
										<option>Sum</option>
										<option>Count</option>
									</select>
								</td>
								<td class="p-4">
									<select bind:value={metric.group} class="p-2 bg-transparent">
										<option>None</option>
										<option>Group A</option>
										<option>Group B</option>
									</select>
								</td>
								<td class="mx-auto rounded-lg cursor-pointer hover:bg-website-tertiary">
									<button
										type="button"
										class="flex items-center justify-center w-full "
										onclick={() => thresholdModal.update((value) => true)}
									>
										<img src={bell_icon} alt="bell_icon" class="w-5 mx-auto" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Modal Footer -->
		<div
			class="flex justify-end p-4 border-t rounded-b-lg border-brand-primary-gray bg-website-primary"
		>
			<Button content={{ text: 'Done' }} on:click={() => statusModal.update((value) => false)} />
		</div>
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
		background-color: #484849;
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
		right: 0.25rem; /* Changed from 'left' to 'right' for default unchecked state */
		transition: transform 0.3s ease-in-out;
	}

	.toggle-checkbox:checked + .toggle-label {
		background-color: #1d1e20;
		border: 1.5px solid #9ca3ae;
	}

	.toggle-checkbox:checked + .toggle-label::before {
		transform: translateX(-1rem); /* Moves the circle to the left when checked */
		background-color: #9ca3ae;
	}

	::-webkit-scrollbar {
		width: 0px;
	}
</style>
