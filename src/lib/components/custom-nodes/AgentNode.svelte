<script lang="ts">
	import Node from './Node.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'
	import { Position } from '@xyflow/svelte'

	const props = $props()
</script>

<Node {...props} handles={[Position.Bottom, Position.Top]}>
	{#snippet icon()}
		<IconChangeHistory class="text-indigo-500 w-6 h-6 mb-1" />
	{/snippet}
</Node>
