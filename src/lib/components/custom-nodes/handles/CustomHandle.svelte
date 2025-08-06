<script lang="ts">
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'

	interface Props {
		id: string
		position: Position
		type: 'source' | 'target'
		class?: Array<string> | string
		name: string
	}

	const { id, position, type, class: classes, name }: Props = $props()

	// The handle is made with a wrapped div so we can add some invisible padding around it
	// so the hitbox for the handle gets bigger

	const top = $derived(position === Position.Top)
</script>

<div
	class={[
		'absolute relative z-10 flex items-center justify-center',
		top ? 'translate-y-full flex-col' : ' -translate-y-full flex-col-reverse'
	]}
>
	<span
		class={[
			'text-main-400 truncate font-sans text-xs',
			top ? '-translate-y-full pb-1.5' : 'translate-y-full pt-1'
		]}>{name}</span
	>
	<Handle {id} {type} {position} class={['z-10 !border-none !bg-transparent p-3', classes]}>
		<div
			style="border-color: color-mix(in oklab, var(--node-color) 80%, transparent)"
			class="bg-main-950/80 pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
		></div>
	</Handle>
</div>
