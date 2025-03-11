<script lang="ts">
	import { Handle } from '@xyflow/svelte'
	import type { Position } from '@xyflow/svelte'

	interface Props {
		id: string
		position: Position
		type: 'source' | 'target'
		class?: Array<string> | string
	}

	const { id, position, type, class: classes }: Props = $props()
</script>

<div class="relative">
	<Handle {id} {type} {position} class={['z-10 !size-2 !bg-[#000]/80', classes].join(' ')} />
</div>
