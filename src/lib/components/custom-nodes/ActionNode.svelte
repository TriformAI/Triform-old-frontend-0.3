<script lang="ts">
	import Node from './Node.svelte'
	import IconSquare from '~icons/material-symbols/square-rounded'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconSquare class=" text-main-300 rotate-45" />
	{/snippet}
</Node>
