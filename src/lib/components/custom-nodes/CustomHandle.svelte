<script lang="ts">
	import { Handle } from '@xyflow/svelte'
	import type { Position } from '@xyflow/svelte'

	interface Props {
		id: string
		position: Position
		type: 'source' | 'target'
	}

	const { id, position, type }: Props = $props()
</script>

<div class="relative">
	<Handle
		{id}
		{type}
		{position}
		isConnectable={type !== 'target'}
		class="z-10 !size-2 !bg-[#000]/80 {type === 'target' && 'opacity-0'}"
	/>
</div>
