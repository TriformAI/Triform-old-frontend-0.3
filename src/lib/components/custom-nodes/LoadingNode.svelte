<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte'
	import IconAction from '~icons/mdi/rhombus'

	const props = $props()
</script>

<div
	class="border-main-500 relative flex size-20 items-center justify-center rounded-full border p-2 transition-all"
>
	<Handle type="target" position={Position.Top} class={`z-10 !border-none !bg-transparent p-3`}
	></Handle>

	<IconAction class="text-main-300" />
</div>
