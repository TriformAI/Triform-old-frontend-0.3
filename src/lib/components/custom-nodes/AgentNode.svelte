<script lang="ts">
	import Node from './Node.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconChangeHistory class="text-indigo-500 w-6 h-6 mb-1" />
	{/snippet}
</Node>
