<script lang="ts">
	import Node from './Node.svelte'
	import IconEndpoint from '~icons/material-symbols/bolt'

	const props = $props()
	$inspect(props.position)
</script>

<Node {...props}>
	{#snippet icon()}
		<IconEndpoint class="text-warning-400 size-6" />
	{/snippet}
</Node>
