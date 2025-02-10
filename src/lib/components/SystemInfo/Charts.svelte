<script lang="ts">
	import Chart from '../Chart.svelte'

	let { data } = $props()
</script>

<div class="flex w-full items-center justify-between gap-x-8 overflow-auto">
	{#each data as stat}
		<div class="w-full text-white">
			<div class="mb-2 flex w-full items-start justify-between">
				<h2 class="text-md relative flex items-center text-white">{stat.label}</h2>
				<p class="text-md text-white">
					{stat.count} <span class="text-md text-brand-light-gray ml-3">+0.0%</span>
				</p>
			</div>

			<Chart lineColor={stat.color} width={32} height={15} />
		</div>
	{/each}
</div>
