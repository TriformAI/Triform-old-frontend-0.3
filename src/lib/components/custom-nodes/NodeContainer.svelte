<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './handles/CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'

	import type { Uuid } from '$lib/types/agent'

	interface Props {
		id: Uuid
		body: Snippet
		showTargetHandle?: boolean
		invisibleHandles?: Array<'source' | 'target'>
	}

	const props: Props = $props()
	const { id, body, showTargetHandle = true, invisibleHandles = [] } = $derived(props)
</script>

<div class="group/container relative h-full w-full">
	{#if showTargetHandle}
		<CustomHandle
			{id}
			type="target"
			position={Position.Top}
			class={[invisibleHandles.includes('target') ? 'invisible' : '']}
		/>
	{/if}

	{@render body()}

	<CustomHandle
		{id}
		type="source"
		position={Position.Bottom}
		class={[invisibleHandles.includes('source') ? 'hidden' : '']}
	/>
</div>
