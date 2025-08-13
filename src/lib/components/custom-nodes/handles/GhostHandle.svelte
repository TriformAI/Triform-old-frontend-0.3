<script lang="ts">
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'

	interface Props {
		class?: string
		type: 'source' | 'target'
	}
	const { type, class: classes }: Props = $props()
</script>

<div class={['relative', classes]}>
	<Handle
		id={`ghost-${type}`}
		{type}
		position={type === 'source' ? Position.Bottom : Position.Top}
		class="!bg-main-600 z-10 flex size-6! items-center justify-center rounded-full !border-none p-1.5"
	>
		<div class="bg-main-400 h-full w-full rounded-full"></div>
	</Handle>
</div>
