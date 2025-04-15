<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Snippet } from 'svelte'
	import { useNodes } from '@xyflow/svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import ContextMenu from '$lib/components/atoms/ContextMenu.svelte'

	import NodeContainer from './NodeContainer.svelte'
	import NodeActions from './NodeActions.svelte'

	interface Props {
		id: Node['id']
		data: NodeData
		selected: boolean
		icon?: Snippet
		shape: 'circle' | 'square'
		class?: string
	}

	const props: Props = $props()

	const { id, data, selected, icon, shape = 'circle', class: classes } = $derived(props)
	// const { state: nodeState } = $derived(data)

	const borderClass = $derived.by(() => {
		return ''
		// if (!nodeState) return ''

		// return {
		// 	success: 'border-emerald-500',
		// 	error: 'border-red-500',
		// 	running: 'border-accent-500'
		// }[nodeState]
	})

	const nodes = useNodes()
	let node: Node | undefined = $state()
	nodes.subscribe(nodes => {
		const n = nodes.find(n => n.id === id)
		if (n) node = n as Node
	})

	const useSvelteFlow = useSvelteFlowHook()
	const openFn = () => {
		// Whenever a node is double clicked, run the first action menu item
		if (!node?.type) return
		const actions = getActions(node.type)
		actions[0]?.onClick?.(node, useSvelteFlow)
	}

	let contextIsOpen = $state(false)
</script>

<NodeContainer {...props} showTargetHandle={node?.type !== 'endpoint-node'}>
	{#snippet body()}
		<ContextMenu bind:open={contextIsOpen}>
			{#snippet trigger()}
				<div
					class={[
						'node-inner transition-[transform_opacity] duration-200 ease-(--easing-circ)',
						node?.data.props.deleted ? 'scale-50 opacity-0' : 'scale-100',
						node?.data.props.creating ? 'animate-pulse cursor-progress' : ''
					]}
				>
					<div
						class={[
							'bg-main-900 absolute inset-x-0 -top-1 -translate-y-full truncate rounded py-0.5 text-center text-sm font-semibold transition',
							selected ? 'text-main-300' : 'text-main-400'
						]}
					>
						<span class="whitespace-nowrap">{data.trinode.spec.meta.name}</span>
					</div>
					<button
						class={[
							'relative flex size-20 items-center justify-center rounded-full border border-[var(--node-color)] p-2 transition-all',
							shape === 'circle' && 'rounded-full',
							shape === 'square' && 'rounded-md',
							borderClass,
							classes
						]}
						style:background-color={selected
							? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 40%, black) 50%, transparent)'
							: undefined}
						ondblclickcapture={openFn}
					>
						<span class="drop-shadow-[0px_0px_10px_var(--node-color)]">
							{@render icon?.()}
						</span>
					</button>
				</div>
			{/snippet}
			{#snippet content()}
				<NodeActions {node} onActionClick={() => (contextIsOpen = false)} />
			{/snippet}
		</ContextMenu>
	{/snippet}
</NodeContainer>

<style>
	.node-inner {
		transition-behavior: allow-discrete;

		@starting-style {
			transform: scale(0.5);
			opacity: 0;
		}
	}
</style>
