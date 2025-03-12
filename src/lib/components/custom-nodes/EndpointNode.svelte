<script lang="ts">
	import Node from './Node.svelte'
	import IconEndpoint from '~icons/material-symbols/bolt'

	const props = $props()
</script>

<Node {...props} --node-color="var(--color-warning-300)">
	{#snippet icon()}
		<IconEndpoint class="text-warning-400 size-6" />
	{/snippet}
</Node>
