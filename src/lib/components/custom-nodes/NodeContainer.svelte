<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'

	import type { UUID as Uuid } from 'crypto'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'

	interface Props {
		id: Uuid
		body: Snippet
		showTargetHandle?: boolean
		showSourceHandle?: boolean
		invisibleHandles?: Array<'source' | 'target'>
		data: NodeData | MetaNodeData
	}

	const props: Props = $props()
	const {
		id,
		body,
		showTargetHandle = true,
		showSourceHandle = true,
		invisibleHandles = [],
		data
	} = $derived(props)
</script>

<div class="group/container relative h-full w-full">
	{#if showTargetHandle}
		<div class="-mt-5.5 flex flex-row items-center justify-around gap-5">
			{#each Object.keys(data.trinode.spec.spec.inputs) as name}
				<CustomHandle
					id={name}
					{name}
					type="target"
					position={Position.Top}
					class={[invisibleHandles.includes('target') ? 'pointer-events-none invisible' : '']}
				/>
			{/each}
		</div>
	{/if}

	{@render body()}

	{#if showSourceHandle}
		<div class="flex flex-row items-center justify-around gap-5">
			{#each Object.keys(data.trinode.spec.spec.outputs) as name}
				<CustomHandle
					id={name}
					{name}
					type="source"
					position={Position.Bottom}
					class={[invisibleHandles.includes('source') ? 'pointer-events-none invisible' : '']}
				/>
			{/each}
		</div>
	{/if}
</div>
