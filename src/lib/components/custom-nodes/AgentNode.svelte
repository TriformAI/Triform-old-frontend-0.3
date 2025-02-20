<script lang="ts">
	import Node from './Node.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconChangeHistory class="text-accent-500 mb-1 h-6 w-6" />
	{/snippet}
</Node>
