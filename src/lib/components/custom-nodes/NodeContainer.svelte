<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import { canvasState, getCurrentContainer, getNodes } from '$lib/stores/canvas.svelte'
	import { isAction, isAgent, isProject } from '$lib/schemas'
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

	const node = $derived(getNodes().find(node => node.id === nodeId))

	const hideHandles = $derived(isProject(getCurrentContainer()) || isAgent(getCurrentContainer()))
</script>

<div class={['group/container relative w-full', hideHandles && 'mt-2']}>
	{#if node?.type !== 'input-node'}
		<div class={[hideHandles && 'hidden']}>
			<div class={['mb-2 flex h-0 w-full items-center justify-around gap-0']}>
				{#each targetHandles as name}
					<CustomHandle id={name} {name} type="target" position={Position.Top} {nodeId} />
				{/each}
			</div>
		</div>
		{#if node?.type !== 'action-node'}
			<div
				class={[
					targetHandles.length ? 'float-right' : 'mx-auto',
					!canvasState.connecting && 'transition delay-200',
					'group-hover/container:pointer-events-auto group-hover/container:opacity-100',
					targetHandles.length &&
						(canvasState.connectingFrom?.handleType === 'target' || !canvasState.connecting) &&
						'pointer-events-none opacity-0',
					node?.type === 'output-node' && targetHandles.length ? '-mt-0.5 mr-1' : '-mt-0.5'
				]}
			>
				<GhostHandle type="target" {nodeId} />
			</div>
		{/if}
	{/if}

	{@render body()}

	{#if node?.type !== 'output-node'}
		<div class={[hideHandles && 'hidden']}>
			<div class="flex w-full items-center justify-around gap-0">
				{#each sourceHandles as name}
					<CustomHandle id={name} {name} type="source" position={Position.Bottom} {nodeId} />
				{/each}
			</div>
		</div>
		{#if node?.type !== 'action-node'}
			<div
				class={[
					sourceHandles.length ? 'float-right' : 'mx-auto',
					!canvasState.connecting && 'transition delay-200',
					'group-hover/container:pointer-events-auto group-hover/container:opacity-100',
					sourceHandles.length &&
						(canvasState.connectingFrom?.handleType === 'source' || !canvasState.connecting) &&
						'pointer-events-none opacity-0',
					node?.type === 'input-node' && sourceHandles.length ? '-mt-5 mr-1' : '-mt-0.5',
					node?.type !== 'input-node' && sourceHandles.length && '-mt-5'
				]}
			>
				<GhostHandle type="source" {nodeId} />
			</div>
		{/if}
	{/if}
</div>
