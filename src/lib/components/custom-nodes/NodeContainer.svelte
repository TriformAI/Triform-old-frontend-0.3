<script lang="ts">
	import type { Snippet } from 'svelte'
	import CustomHandle from './CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'

	import type { Uuid } from '$lib/types/agent'

	interface Props {
		id: Uuid
		body: Snippet
	}

	const props: Props = $props()
	const { id, body } = $derived(props)
</script>

<div class="group/container relative h-full w-full">
	<div>
		<CustomHandle {id} type="target" position={Position.Top} />
	</div>

	{@render body()}

	<div>
		<CustomHandle {id} type="source" position={Position.Bottom} />
	</div>
</div>
