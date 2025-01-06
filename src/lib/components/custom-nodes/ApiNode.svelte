<script lang="ts">
	import Node from './Node.svelte'
	import IconCircle from '~icons/material-symbols/circle'
	import { Position } from '@xyflow/svelte'

	const props = $props()
</script>

<Node
	{...props}
	handles={[Position.Bottom]}
>
	{#snippet icon()}
		<IconCircle class="text-blue-400" />
	{/snippet}
</Node>
