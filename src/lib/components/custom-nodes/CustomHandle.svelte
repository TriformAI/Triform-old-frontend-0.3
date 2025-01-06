<script lang="ts">
	import { Handle } from '@xyflow/svelte'

	import type { Position } from '@xyflow/svelte'

	const {
		id,
		position,
		type
	}: {
		id: string,
		position: Position,
		type: 'source' | 'target'
	} = $props()
</script>

<div class="relative">
	<Handle
		{id}
		{type}
		{position}
		style="width: 30px; height: 20px"
		class="invisible"
	/>
</div>

<style>
</style>
