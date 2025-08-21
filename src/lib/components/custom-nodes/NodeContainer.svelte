<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import { getCurrentContainer, getNodes } from '$lib/stores/canvas.svelte'
	import { isProject } from '$lib/schemas'
	const {
		body,
		targetHandles,
		sourceHandles,
		id: nodeId,
		data
	}: {
		id?: string
		body: Snippet
		targetHandles: string[]
		sourceHandles: string[]
		data?: NodeData | MetaNodeData
	} = $props()

	const currentIsProject = $derived(isProject(getCurrentContainer()))

	const node = $derived(getNodes().find(node => node.id === nodeId))
</script>

<div class="group/container relative w-full">
	{#if !currentIsProject && node?.type !== 'input-node'}
		<div class={['mb-2 flex h-0 items-center justify-around gap-5']}>
			{#each targetHandles as name}
				<CustomHandle id={name} {name} type="target" position={Position.Top} {nodeId} />
			{:else}
				<GhostHandle type="target" {nodeId} />
			{/each}
		</div>
	{/if}

	{@render body()}

	{#if !currentIsProject && node?.type !== 'output-node'}
		<div class={['flex items-center justify-around gap-5']}>
			{#each sourceHandles as name}
				<CustomHandle id={name} {name} type="source" position={Position.Bottom} {nodeId} />
			{:else}
				<GhostHandle type="source" {nodeId} />
			{/each}
		</div>
	{/if}
</div>
