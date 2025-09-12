<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import { getCurrentContainer, getNodes } from '$lib/stores/canvas.svelte'
	import { isAction, isProject } from '$lib/schemas'
	import { getNodeExecutionState } from '$lib/stores/execution.svelte'

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

	const hideHandles = $derived(currentIsProject)

	const executionState = $derived(getNodeExecutionState(nodeId ?? ''))
</script>

<div class={['group/container relative w-full']}>
	{#if node?.type !== 'input-node'}
		<div class={[hideHandles && 'invisible']}>
			<div class={['mx-auto mb-2 flex h-0 max-w-[80%] items-center justify-around gap-5']}>
				{#each targetHandles as name}
					<CustomHandle id={name} {name} type="target" position={Position.Top} {nodeId} />
				{/each}
			</div>
			{#if node?.type !== 'action-node'}
				<div
					class={[
						targetHandles.length ? 'float-right' : 'mx-auto',
						'transition delay-200',
						'group-hover/container:pointer-events-auto group-hover/container:opacity-100',
						targetHandles.length && 'pointer-events-none opacity-0',
						node?.type === 'output-node' && targetHandles.length ? '-mt-0.5 mr-1' : '-mt-0.5'
					]}
				>
					<GhostHandle type="target" {nodeId} />
				</div>
			{/if}
		</div>
	{/if}

	{@render body()}

	{#if node?.type !== 'output-node'}
		<div class={[hideHandles && 'invisible']}>
			<div class="mx-auto flex max-w-[80%] items-center justify-around gap-5">
				{#each sourceHandles as name}
					<CustomHandle id={name} {name} type="source" position={Position.Bottom} {nodeId} />
				{/each}
			</div>
			{#if node?.type !== 'action-node'}
				<div
					class={[
						sourceHandles.length ? 'float-right' : 'mx-auto',
						'transition delay-200',
						'group-hover/container:pointer-events-auto group-hover/container:opacity-100',
						sourceHandles.length && 'pointer-events-none opacity-0',
						node?.type === 'input-node' && sourceHandles.length ? '-mt-5 mr-1' : '-mt-0.5',
						node?.type !== 'input-node' && sourceHandles.length && '-mt-5'
					]}
				>
					<GhostHandle type="source" {nodeId} />
				</div>
			{/if}
		</div>
	{/if}
</div>
