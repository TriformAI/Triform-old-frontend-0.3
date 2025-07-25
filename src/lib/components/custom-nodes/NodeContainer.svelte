<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'

	import type { UUID as Uuid } from 'crypto'

	interface Props {
		id: Uuid
		body: Snippet
		showTargetHandle?: boolean
		showSourceHandle?: boolean
		invisibleHandles?: Array<'source' | 'target'>
	}

	const props: Props = $props()
	const {
		id,
		body,
		showTargetHandle = true,
		showSourceHandle = true,
		invisibleHandles = []
	} = $derived(props)
</script>

<div class="group/container relative h-full w-full">
	{#if showTargetHandle}
		<CustomHandle
			{id}
			type="target"
			position={Position.Top}
			class={[invisibleHandles.includes('target') ? 'pointer-events-none invisible' : '']}
		/>
	{/if}

	{@render body()}

	{#if showSourceHandle}
		<CustomHandle
			{id}
			type="source"
			position={Position.Bottom}
			class={[invisibleHandles.includes('source') ? 'pointer-events-none invisible' : '']}
		/>
	{/if}
</div>
