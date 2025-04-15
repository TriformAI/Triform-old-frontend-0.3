<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Uuid } from '$lib/types/agent'

	import NodeContainer from './NodeContainer.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import ContextMenu from '$lib/components/atoms/ContextMenu.svelte'
	import FlowHandle from './handles/FlowHandle.svelte'

	import IconChevron from '~icons/material-symbols/chevron-right-rounded'
	import NodeActions from './NodeActions.svelte'

	interface Props {
		id: Uuid
		data: NodeData
		selected: boolean
	}

	const { id, data, selected }: Props = $props()

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode } = useSvelteFlow

	let node = $derived(getNode(id)) as Node

	// I don't like how this function is defined on both GroupNode and Node, should probably consolidate them
	const openFn = () => {
		// Whenever a node is double clicked, run the first action menu item
		if (!node?.type) return
		const actions = getActions(node?.type)
		actions?.[0]?.onClick?.(node, useSvelteFlow)
	}

	const closeFn = () => {
		if (!node?.type) return
		const action = getActions(node.type).find(a => a.id === 'close')
		action?.onClick?.(node, useSvelteFlow)
	}

	let contextMenuOpen = $state(false)
</script>

<NodeContainer {id} invisibleHandles={['source', 'target']}>
	{#snippet body()}
		<div
			class={[
				'border-main-700 flex h-full w-full justify-center rounded border text-center',
				node?.data.props.creating && 'animate-pulse'
			]}
		>
			<ContextMenu bind:open={contextMenuOpen}>
				{#snippet trigger()}
					<button
						class={[
							'border-main-700 bg-main-900/40 pointer-events-auto rounded-t-md border py-1 ps-4 text-base',
							'-translate-y-full font-semibold backdrop-blur-xs transition',
							'relative z-10 flex gap-x-1',
							'flow_drag-handle',
							selected ? 'text-main-200' : 'text-main-300'
						]}
						ondblclick={openFn}
					>
						<!-- <IconNetworkNode
					class="text-accent-400 my-auto mb-1 h-4 drop-shadow-[0px_0px_5px_var(--color-accent-600)]"
				/> -->
						{data.trinode.spec.meta.name}
						<div
							class="text-main-400 hover:text-main-200 flex items-center self-stretch pr-3 pl-1"
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
					<FlowHandle {id} type="input" />
				{/snippet}

				{#snippet content()}
					<NodeActions {node} onActionClick={() => (contextMenuOpen = false)} />
				{/snippet}
			</ContextMenu>
		</div>
		<FlowHandle {id} type="output" />
	{/snippet}
</NodeContainer>
