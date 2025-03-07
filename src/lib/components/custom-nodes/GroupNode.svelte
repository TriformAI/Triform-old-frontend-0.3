<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Uuid } from '$lib/types/agent'

	import NodeContainer from './NodeContainer.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'
	import { onMount } from 'svelte'

	const {
		id,
		data,
		selected
	}: {
		id: Uuid
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
			class={[
				'border-main-300/10 bg-main-900/30 flex h-full w-full flex-row',
				'justify-center rounded border text-center'
			]}
		>
			<button
				class={[
					'border-main-600/10 pointer-events-auto -mt-4 h-fit w-max flex-shrink-0 rounded border px-5 py-1',
					'font-bold backdrop-blur-sm transition',
					'flow_drag-handle',
					selected ? 'text-main-200' : 'text-main-300'
				]}
				ondblclick={openFn}
			>
				{data.component_name}
			</button>
		</div>
	{/snippet}
</NodeContainer>
