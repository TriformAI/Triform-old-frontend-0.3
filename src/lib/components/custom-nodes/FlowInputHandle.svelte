<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte'
	import type { Snippet } from 'svelte'

	const {
		id,
		children
	}: {
		id: string
		children?: Snippet
	} = $props()
</script>

<Handle
	type="source"
	position={Position.Bottom}
	{id}
	class="absolute !bottom-full !h-fit !w-fit !border-none !bg-transparent"
>
	{@render children?.()}
</Handle>
