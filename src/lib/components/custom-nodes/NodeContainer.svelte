<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import { isProject } from '$lib/schemas'
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

	const currentIsProject = $derived(isProject(getCurrentContainer()))
</script>

<div class="group/container relative w-full">
	{#if !currentIsProject}
		<div class={['mb-2 flex h-0 items-center justify-around gap-5']}>
			{#each targetHandles as name}
				<CustomHandle id={name} {name} type="target" position={Position.Top} />
			{/each}

			{#if showGhostTargetHandle}
				<GhostHandle type="target" class="mt-4" />
			{/if}
		</div>
	{/if}

	{@render body()}

	{#if !currentIsProject}
		<div class={['flex items-center justify-around gap-5']}>
			{#each sourceHandles as name}
				<CustomHandle id={name} {name} type="source" position={Position.Bottom} />
			{/each}

			{#if showGhostSourceHandle}
				<GhostHandle type="source" class="-mt-5" />
			{/if}
		</div>
	{/if}
</div>
