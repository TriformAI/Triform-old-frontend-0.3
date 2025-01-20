<script lang="ts">
	import type { NodeData } from '$lib/types/flow'
	import type { Snippet } from 'svelte'
	import { Position } from '@xyflow/svelte'

	import CustomHandle from './CustomHandle.svelte'

	const {
		id,
		data,
		selected,
		handles = [],
		...rest
	}: {
		id: string
		data: NodeData
		selected: boolean
		handles: Position[]
	} = $props()

	const { name, state, version, onOpen } = data

	const getBorderClass = (state?: string) => {
		switch (state) {
			case 'success':
				return 'border-emerald-500'
			case 'error':
				return 'border-red-500'
			case 'running':
				return 'border-indigo-500'
			default:
				return selected ? 'border-slate-200' : 'border-slate-300'
		}
	}

	const onclick = () => {
		// Essentially acts as a double click (select and then click again to open)
		// This should be probably be changed in the future to always be a double click, or something
		if (selected && onOpen) onOpen()
	}
</script>

<div
	class="p-2 h-full w-full border flex justify-center items-center relative transition-all
        {selected ? 'border-[2px] ease-in duration-100' : ''}
        {getBorderClass(state)}
      "
>
	{#if handles.includes(Position.Top)}
		<CustomHandle {id} type="target" position={Position.Top} />
	{/if}
	<div>
		<span
			class="
        absolute flex-shrink-0 w-max text-[8px] font-bold right-14 top-5 float-right transition
        {selected ? 'text-slate-200' : 'text-slate-300'}
      "
		>
			{name}
			<span class="block transition {selected ? 'text-slate-300' : 'text-slate-400'}">
				v{version}
			</span>
			<span
				class="block transition text-[6px] font-normal italic {selected
					? 'text-slate-400'
					: 'text-slate-500'}"
			>
				{data.id}
			</span>
		</span>
		<div {onclick}>
			<div
				class="absolute transform -translate-x-1/2 -translate-y-1/2 custom-node-icon-shadow top-1/2 left-1/2"
			></div>
		</div>
	</div>
	{#if handles.includes(Position.Bottom)}
		<CustomHandle {id} type="source" position={Position.Bottom} />
	{/if}
</div>

<style>
</style>
