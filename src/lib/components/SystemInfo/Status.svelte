<script lang="ts">
	import green_check from '$lib/icons/green_check.svg'

	let { data } = $props()
</script>

<div class="flex items-center justify-between py-4">
	<div class="flex items-center gap-x-3">
		<img src={green_check} alt="green_check" class="w-5" />
		<h2 class="text-sm text-primary-green">All system are operational</h2>
	</div>

	<dl class="flex items-center gap-x-8 text-white">
		{#each data as stat}
			<div class="flex items-center gap-3">
				<dt class="opacity-50">{stat.label}</dt>
				<dd class="font-semibold">{stat.count}</dd>
			</div>
		{/each}
	</dl>
</div>
