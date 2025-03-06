<script lang="ts">
	import Node from './Node.svelte'
	import IconNetworkNode from '~icons/material-symbols/network-node'

	const props = $props()
</script>

<Node {...props} shape="square" class="border-accent-300">
	{#snippet icon()}
		<IconNetworkNode class="text-accent-500 mb-1 h-6 w-6" />
	{/snippet}
</Node>
