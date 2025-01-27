<script lang="ts">
	import type { NodeData } from '$lib/types/flow'
	import { Position } from '@xyflow/svelte'

	import NodeContainer from './NodeContainer.svelte'

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
</script>

<NodeContainer {id}>
	{#snippet body()}
		<div
			class="h-full w-full flex flex-row justify-center text-center border border-slate-300/10 bg-zinc-900/30 rounded"
		>
			<span
				class="
					flex-shrink-0 w-max text-[8px] font-bold transition bg-zinc-900/50 backdrop-blur-sm px-5 rounded h-fit -mt-4
					{selected ? 'text-slate-200' : 'text-slate-300'}
				"
			>
				{name}
				<span class="block transition {selected ? 'text-slate-300' : 'text-slate-400'}">
					v{version}
				</span>
			</span>
		</div>
	{/snippet}
</NodeContainer>
