<script lang="ts">
	import Chart from '../Chart.svelte'

	let { data } = $props()
</script>

<div class="flex items-center justify-between w-full overflow-auto gap-x-8">
	{#each data as stat}
		<div class="w-full text-white">
			<div class="flex items-start justify-between w-full mb-2">
				<h2 class="relative flex items-center text-white text-md">{stat.label}</h2>
				<p class="text-white text-md">
					{stat.count} <span class="ml-3 text-md text-brand-light-gray">+0.0%</span>
				</p>
			</div>

			<Chart lineColor={stat.color} width={32} height={15} />
		</div>
	{/each}
</div>
