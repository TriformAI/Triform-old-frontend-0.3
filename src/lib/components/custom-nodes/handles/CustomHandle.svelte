<script lang="ts">
	import { Handle } from '@xyflow/svelte'
	import type { Position } from '@xyflow/svelte'

	interface Props {
		id: string
		position: Position
		type: 'source' | 'target'
		class?: Array<string> | string
	}

	const { id, position, type, class: classes }: Props = $props()

	// The handle is made with a wrapped div so we can add some invisible padding around it
	// so the hitbox for the handle gets bigger
</script>

<div class="relative">
	<Handle {id} {type} {position} class={['z-10 !border-none !bg-transparent p-3', classes]}>
		<div
			style="border-color: color-mix(in oklab, var(--node-color) 80%, transparent)"
			class="bg-main-950/80 pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
		></div>
	</Handle>
</div>
