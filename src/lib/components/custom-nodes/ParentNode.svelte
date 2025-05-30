<script lang="ts">
	import { Position } from '@xyflow/svelte'
	import IconArrow from '~icons/material-symbols/arrow-downward-alt'
	import CustomHandle from '$lib/components/custom-nodes/handles/CustomHandle.svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	const props = $props()

	const gotoParent = () => {
		goto(`/project/${page.params.id.split('/').slice(0, -1).join('/')}`)
	}
</script>

<div class="relative grid size-20 items-end justify-center pb-1 transition-all">
	<button ondblclick={gotoParent}>
		<div
			class={[
				'border-accent-300 grid size-12 place-items-center rounded-full border',
				'transition',
				props.selected && 'border-accent-200 bg-accent-500/10'
			]}
		>
			<IconArrow
				class="text-accent-400 size-6 drop-shadow-[0px_0px_10px_var(--color-accent-50)] transition"
			/>
		</div>
	</button>

	<CustomHandle
		--node-color="var(--color-accent-300)"
		class="mx-auto -translate-y-3.5"
		id={props.id}
		type="source"
		position={Position.Bottom}
	/>
</div>
