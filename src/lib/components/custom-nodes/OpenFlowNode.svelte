<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Uuid } from '$lib/types/agent'

	import NodeContainer from './NodeContainer.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'
	import { onMount } from 'svelte'
	import { getNodeProps } from '$lib/stores/canvas.svelte'

	import IconNetworkNode from '~icons/material-symbols/network-node'

	const {
		id,
		data,
		selected
	}: {
		id: Uuid
		data: NodeData
		selected: boolean
	} = $props()

	const nodeProps = $derived(getNodeProps(id))

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
				'justify-center rounded border text-center',
				nodeProps?.creating && 'animate-pulse'
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
				<IconNetworkNode
					class="text-accent-400 my-auto mb-1 h-4 drop-shadow-[0px_0px_5px_var(--color-accent-600)]"
				/>
				{data.component_name}
			</button>
		</div>
	{/snippet}
</NodeContainer>
