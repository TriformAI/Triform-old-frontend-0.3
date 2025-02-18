<script lang="ts">
	import IconCheck from '~icons/material-symbols/check-circle-outline'

	let { data } = $props()
</script>

<div class="flex items-center justify-between py-4">
	<div class="text-success flex items-center gap-x-3">
		<IconCheck class="size-6" />
		<h2 class=" text-sm">All system are operational</h2>
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
