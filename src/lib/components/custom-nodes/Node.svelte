<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Snippet } from 'svelte'
	import NodeActions from './NodeActions.svelte'
	import { useNodes } from '@xyflow/svelte'
	import { getNodeProps } from '$lib/stores/canvas.svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'

	import NodeContainer from './NodeContainer.svelte'

	interface Props {
		id: Node['id']
		data: NodeData
		selected: boolean
		icon: Snippet
	}

	const props: Props = $props()

	const { id, data, selected, icon } = $derived(props)
	const { state: nodeState } = $derived(data)

	const nodeProps = $derived(getNodeProps(id))

	const getBorderClass = (nodeState?: string) => {
		switch (nodeState) {
			case 'success':
				return 'border-emerald-500'
			case 'error':
				return 'border-red-500'
			case 'running':
				return 'border-accent-500'
			default:
				return selected ? 'border-main-200' : 'border-main-300'
		}
	}

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
		const actions = actionsMap().get(node.type)
		actions?.[0]?.onClick?.(node, useSvelteFlow)
	}
</script>

<NodeContainer {...props}>
	{#snippet body()}
		<div
			class={[
				'node-inner transition-[transform_opacity] duration-200 ease-(--easing-circ)',
				nodeProps?.deleted ? 'scale-50 opacity-0' : 'scale-100',
				nodeProps?.creating ? 'animate-pulse cursor-progress' : ''
			]}
		>
			<div
				class="
						absolute -start-4 top-1/2 -translate-x-full -translate-y-1/2 text-end font-semibold transition
						{selected ? 'text-main-200' : 'text-main-300'}
					"
			>
				<span class="whitespace-nowrap">{data.component_name}</span>
			</div>

			<button
				class="
						relative flex size-20 items-center justify-center rounded-full border p-2 transition-all
						{selected ? 'border-[2px] duration-100 ease-in' : ''}
						{getBorderClass(nodeState)}
					"
				ondblclickcapture={openFn}
			>
				<span class="custom-node-icon-shadow">{@render icon()}</span>
			</button>
		</div>

		<NodeActions {node} />
	{/snippet}
</NodeContainer>

<style>
	/* Bit of a hack to lower the opacity of the shadow (currentColor) */
	:global(.custom-node-icon-shadow > *) {
		filter: drop-shadow(0px 0px 10px currentColor);
	}

	.node-inner {
		transition-behavior: allow-discrete;

		@starting-style {
			transform: scale(0.5);
			opacity: 0;
		}
	}
</style>
