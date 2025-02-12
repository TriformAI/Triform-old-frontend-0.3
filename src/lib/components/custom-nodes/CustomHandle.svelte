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
	<Handle {id} {type} {position} isConnectable={false} class="opacity-0" />
</div>
