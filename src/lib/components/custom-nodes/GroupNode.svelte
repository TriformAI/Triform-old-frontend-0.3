<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'

	import NodeContainer from './NodeContainer.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'
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

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode } = useSvelteFlow
	let node: Node
	onMount(() => {
		const n = getNode(id)
		if (n) node = n as Node
	})

	// I don't like how this function is defined on both GroupNode and Node, should probably consolidate them
	const openFn = () => {
		// Whenever a node is double clicked, run the first action menu item
		if (!node?.type) return
		const actions = actionsMap().get(node.type)
		actions?.[0]?.onClick?.(node, useSvelteFlow)
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
