<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte'

	const {
		id,
		type
	}: {
		id: string
		type: 'input' | 'output'
	} = $props()
</script>

<Handle
	id={`${id}:${type}`}
	type={type === 'input' ? 'source' : 'target'}
	position={type === 'input' ? Position.Bottom : Position.Top}
	--drop-shadow-color="color-mix(in oklab, var(--color-main-200) 80%, transparent)"
	class={[
		'text-main absolute !h-fit !w-fit !border-none !bg-transparent drop-shadow-[0px_0px_8px_var(--drop-shadow-color)]',
		type === 'input' ? '!bottom-[99.5%]' : '!top-full'
	].join(' ')}
>
	<svg
		width="18"
		height="18"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="pointer-events-none"
	>
		<circle cx="10" cy="10" r="3.5" fill="currentColor" />
		<circle cx="10" cy="10" r="9" stroke="currentColor" />
	</svg>
</Handle>
