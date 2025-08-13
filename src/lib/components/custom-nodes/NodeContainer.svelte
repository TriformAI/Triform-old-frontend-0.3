<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'

	const {
		body,
		targetHandles,
		sourceHandles,
		showGhostSourceHandle = false,
		showGhostTargetHandle = false
	}: {
		id?: string
		body: Snippet
		targetHandles: string[]
		sourceHandles: string[]
		showGhostSourceHandle?: boolean
		showGhostTargetHandle?: boolean
		data?: NodeData | MetaNodeData
	} = $props()
</script>

<div class="group/container relative w-full">
	<div class={['mb-2 flex h-0 items-center justify-around gap-5']}>
		{#each targetHandles as name}
			<CustomHandle id={name} {name} type="target" position={Position.Top} />
		{/each}

		{#if showGhostTargetHandle}
			<GhostHandle type="target" class="mt-4" />
		{/if}
	</div>

	{@render body()}

	<div class={['flex items-center justify-around gap-5']}>
		{#each sourceHandles as name}
			<CustomHandle id={name} {name} type="source" position={Position.Bottom} />
		{/each}

		{#if showGhostSourceHandle}
			<GhostHandle type="source" class="-mt-5" />
		{/if}
	</div>
</div>
