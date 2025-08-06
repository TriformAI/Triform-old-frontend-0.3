<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'

	const {
		body,
		targetHandles,
		sourceHandles
	}: {
		id?: string
		body: Snippet
		targetHandles: string[]
		sourceHandles: string[]
		data?: NodeData | MetaNodeData
	} = $props()
</script>

<div class="group/container relative w-full">
	<div class="-mt-5.5 flex flex-row items-center justify-around gap-5">
		{#each targetHandles as name}
			<CustomHandle id={name} {name} type="target" position={Position.Top} />
		{/each}
	</div>

	{@render body()}

	<div class="flex flex-row items-center justify-around gap-5">
		{#each sourceHandles as name}
			<CustomHandle id={name} {name} type="source" position={Position.Bottom} />
		{/each}
	</div>
</div>
