<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import GhostHandle from './handles/GhostHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import {
		canvasState,
		getCurrentContainer,
		getNodes,
		saveContainer
	} from '$lib/stores/canvas.svelte'
	import { isAction, isAgent, isProject } from '$lib/schemas'
	import { getNodeExecutionState } from '$lib/stores/execution.svelte'
	import IconLoop from '~icons/material-symbols/sync-rounded'
	import IconClose from '~icons/material-symbols/close-rounded'
	import Button from '../atoms/Button.svelte'
	import { clone } from '$lib/utils/clone'
	import { fly } from 'svelte/transition'

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

	const isLooping = $derived(node?.data?.trinode?.loop?.enabled)

	const disableLoop = async () => {
		const container = clone(getCurrentContainer())
		node.data.trinode.loop.enabled = false
		await saveContainer(container)
	}
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

	<div
		class={[
			isLooping
				? 'border-main-700 relative flex flex-col items-center gap-3 rounded-lg border px-4 pt-3.5 pb-6'
				: 'border-0 border-transparent p-0',
			'transition-all starting:border-transparent'
		]}
	>
		{#if isLooping}
			<Button
				class={[
					'text-main-500 absolute -top-3 -left-3 size-4 backdrop-blur',
					'opacity-0 transition group-hover/container:opacity-100'
				]}
				onClick={disableLoop}
				variation="link"
			>
				<IconClose class="group-hover/button:text-danger-500 size-4 transition" />
			</Button>
			<div
				class="bg-main-900/10 border-main-800 flex items-center gap-2 rounded-md border px-3 py-1 backdrop-blur"
				in:fly={{ y: -20, duration: 400, delay: 50 }}
			>
				<IconLoop class="text-main-400 size-4" />
				<span class="text-main-300 text-sm capitalize">{node?.data?.trinode?.loop?.type}</span>
			</div>
		{/if}
		<div class={[isLooping && '-translate-x-1 -translate-y-1', 'transition-transform']}>
			{@render body()}
		</div>
	</div>

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
