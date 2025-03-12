<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte'

	const {
		id
	}: {
		id: string
	} = $props()
</script>

<Handle
	type="target"
	position={Position.Top}
	{id}
	--drop-shadow-color="color-mix(in oklab, var(--color-main-200) 80%, transparent)"
	class="text-main absolute !top-full !h-fit !w-fit !border-none !bg-transparent drop-shadow-[0px_0px_8px_var(--drop-shadow-color)]"
>
	<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="10" cy="10" r="3.5" fill="currentColor" />
		<circle cx="10" cy="10" r="9" stroke="currentColor" />
	</svg>
</Handle>
