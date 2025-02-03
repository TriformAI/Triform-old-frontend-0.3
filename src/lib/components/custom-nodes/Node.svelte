<script lang="ts">
	import type { NodeData, Node, NodeType } from '$lib/types/flow'
	import { onMount, type Snippet } from 'svelte'

	import { Position, useNodes } from '@xyflow/svelte'
	import { get } from 'svelte/store'

	import NodeContainer from './NodeContainer.svelte'
	import CustomHandle from './CustomHandle.svelte'

	import { contextMenus } from '$lib/stores/contextMenu.svelte'

	const nodes = useNodes()

	const {
		id,
		data,
		selected,
		icon,
		handles = []
	}: {
		id: string
		data: NodeData
		selected: boolean
		icon: Snippet
		handles: Position[]
	} = $props()

	const { name, state, component_id, component_version, onOpen } = data

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

	let node: Node
	onMount(() => {
		node = get(nodes).filter(n => n.id === id)[0]
	})

	const openFn = () => {
		if (onOpen) return onOpen()
		// If no open function was defined, use the first context menu action instead
		if (!node) return
		const items = contextMenus.get(node.type as NodeType)
		items?.[0]?.onClick?.(node)
	}
</script>

<NodeContainer {id}>
	{#snippet body()}
		<div>
			<span
				class="
						absolute flex-shrink-0 w-max text-[8px] font-bold right-14 top-5 float-right transition
						{selected ? 'text-slate-200' : 'text-slate-300'}
					"
			>
				{name}
				<span class="block transition {selected ? 'text-slate-300' : 'text-slate-400'}">
					v{component_version}
				</span>
				<span
					class="block transition text-[6px] font-normal italic {selected
						? 'text-slate-400'
						: 'text-slate-500'}"
				>
					{component_id}
				</span>
			</span>
			<button
				class="
						rounded-full w-11 h-11 p-2 border flex justify-center items-center relative transition-all
						{selected ? 'border-[2px] ease-in duration-100' : ''}
						{getBorderClass(state)}
					"
				ondblclick={openFn}
			>
				{@render icon()}
				<div
					class="absolute transform -translate-x-1/2 -translate-y-1/2 custom-node-icon-shadow top-1/2 left-1/2"
				>
					{@render icon()}
				</div>
			</button>
		</div>
	{/snippet}
</NodeContainer>

<style>
	/* Bit of a hack to lower the opacity of the shadow (currentColor) */
	:global(.custom-node-icon-shadow > *) {
		opacity: 0.35;
		filter: drop-shadow(0px 0px 10px currentColor);
	}
</style>
