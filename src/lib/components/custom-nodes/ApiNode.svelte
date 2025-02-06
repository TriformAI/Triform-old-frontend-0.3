<script lang="ts">
	import Node from './Node.svelte'
	import IconCircle from '~icons/material-symbols/circle'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconCircle class="text-blue-400" />
	{/snippet}
</Node>
