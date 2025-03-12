<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Uuid } from '$lib/types/agent'

	import NodeContainer from './NodeContainer.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import { onMount } from 'svelte'
	import { getNodeProps } from '$lib/stores/canvas.svelte'

	import FlowOutputHandle from './FlowOutputHandle.svelte'
	import FlowInputHandle from './FlowInputHandle.svelte'

	import IconNetworkNode from '~icons/material-symbols/network-node'
	import IconChevron from '~icons/material-symbols/chevron-right-rounded'

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
		const actions = getActions(node.type)
		actions?.[0]?.onClick?.(node, useSvelteFlow)
	}

	const closeFn = () => {
		if (!node?.type) return
		const action = getActions(node.type).find(a => a.id === 'close')
		action?.onClick?.(node, useSvelteFlow)
	}
</script>

<NodeContainer {id} invisibleHandles={['source', 'target']}>
	{#snippet body()}
		<div
			class={[
				'border-main-700 bg-main-900/30 flex h-full w-full flex-row',
				'justify-center rounded border text-center',
				nodeProps?.creating && 'animate-pulse'
			]}
		>
			<button
				class={[
					'border-main-700 pointer-events-auto h-fit w-max flex-shrink-0 rounded-t-md border py-1 pr-0 pl-5',
					'font-bold backdrop-blur-sm transition',
					'z-10 flex -translate-y-full flex-row justify-center',
					'flow_drag-handle',
					selected ? 'text-main-200' : 'text-main-300'
				]}
				ondblclick={openFn}
			>
				<IconNetworkNode
					class="text-accent-400 my-auto mb-1 h-4 drop-shadow-[0px_0px_5px_var(--color-accent-600)]"
				/>
				{data.component_name}
				<div
					class="text-main-400 hover:text-main-200 flex items-center self-stretch pr-4 pl-1"
					aria-label="Close"
					role="button"
					tabindex="0"
					onclick={closeFn}
					onkeydown={e => ['Enter', ' '].includes(e.key) && closeFn()}
					data-balloon-pos="up"
				>
					<IconChevron class="mt-1 rotate-90 transition" />
				</div>
			</button>
			<FlowInputHandle id={`${id}:input`}></FlowInputHandle>
		</div>
		<FlowOutputHandle id={`${id}:output`} />
	{/snippet}
</NodeContainer>
