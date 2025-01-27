<script lang="ts">
	import Node from './Node.svelte'
	import IconSquare from '~icons/material-symbols/square-rounded'
	import { Position } from '@xyflow/svelte'

	const props = $props()
</script>

<Node {...props} handles={[Position.Top, Position.Bottom]}>
	{#snippet icon()}
		<IconSquare class="text-slate-300 transform rotate-45" />
	{/snippet}
</Node>
