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
			class="
			border-main-300/10 bg-main-900/30 flex h-full w-full flex-row
			justify-center rounded border text-center"
		>
			<button
				class="
					border-main-600/10 bg-main-900/50 pointer-events-auto -mt-4 h-fit w-max flex-shrink-0 rounded border px-5
					font-bold backdrop-blur-sm transition
					{selected ? 'text-main-200' : 'text-main-300'}
					flow_drag-handle
				"
				ondblclick={openFn}
			>
				{data.component_name}
				<span class="block transition {selected ? 'text-main-300' : 'text-main-400'}">
					v{data.component_version}
				</span>
			</button>
		</div>
	{/snippet}
</NodeContainer>
