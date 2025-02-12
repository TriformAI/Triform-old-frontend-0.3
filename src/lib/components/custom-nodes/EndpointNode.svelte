<script lang="ts">
	import Node from './Node.svelte'
	import IconEndpoint from '~icons/material-symbols/bolt'

	const props = $props()
	$inspect(props.position)
</script>

<Node {...props}>
	{#snippet icon()}
		<IconEndpoint class="size-6 text-orange-200" />
	{/snippet}
</Node>
