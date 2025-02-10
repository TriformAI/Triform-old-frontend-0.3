<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'

	import NodeContainer from './NodeContainer.svelte'
	import { contextMenus } from '$lib/stores/contextMenu.svelte'
	import { useSvelteFlow } from '@xyflow/svelte'
	import { onMount } from 'svelte'

	const {
		id,
		data,
		selected
	}: {
		id: string
		data: NodeData
		selected: boolean
	} = $props()

	const { onOpen } = data

	const { getNode } = useSvelteFlow()
	let node: Node
	onMount(() => {
		const n = getNode(id)
		if (n) node = n as Node
	})

	// I don't like how this function is defined on both GroupNode and Node, should probably consolidate them
	const openFn = () => {
		if (onOpen) return onOpen()
		// If no open function was defined, use the first context menu action instead
		if (!node?.type) return
		const items = contextMenus.get(node.type)
		items?.[0]?.onClick?.(node)
	}
</script>

<NodeContainer {id}>
	{#snippet body()}
		<div
			class="h-full w-full flex flex-row justify-center text-center border border-slate-300/10 bg-zinc-900/30 rounded"
		>
			<button
				class="
					flex-shrink-0 w-max text-[8px] font-bold transition bg-zinc-900/50 backdrop-blur-sm px-5 rounded h-fit -mt-4
					border border-zinc-600/10
					{selected ? 'text-slate-200' : 'text-slate-300'}
				"
				ondblclick={openFn}
			>
				{data.component_name}
				<span class="block transition {selected ? 'text-slate-300' : 'text-slate-400'}">
					v{data.component_version}
				</span>
			</button>
		</div>
	{/snippet}
</NodeContainer>
