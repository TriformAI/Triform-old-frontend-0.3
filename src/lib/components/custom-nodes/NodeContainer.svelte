<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'

	import type { Uuid } from '$lib/types/agent'

	interface Props {
		id: Uuid
		body: Snippet
		showTargetHandle?: boolean
	}

	const props: Props = $props()
	const { id, body, showTargetHandle = true } = $derived(props)
</script>

<div class="group/container relative h-full w-full">
	{#if showTargetHandle}
		<CustomHandle {id} type="target" position={Position.Top} />
	{/if}

	{@render body()}

	<CustomHandle {id} type="source" position={Position.Bottom} />
</div>
