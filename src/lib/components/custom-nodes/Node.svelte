<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import type { Snippet } from 'svelte'
	import { useNodes } from '@xyflow/svelte'
	import { getNodeProps } from '$lib/stores/canvas.svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { ContextMenu } from 'bits-ui'

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
	const { state: nodeState } = $derived(data)

	const nodeProps = $derived(getNodeProps(id))

	const borderClass = $derived.by(() => {
		if (!nodeState) return ''

		return {
			success: 'border-emerald-500',
			error: 'border-red-500',
			running: 'border-accent-500'
		}[nodeState]
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
		const actions = actionsMap().get(node.type)
		actions?.[0]?.onClick?.(node, useSvelteFlow)
	}

	let contextIsOpen = $state(false)
</script>

<NodeContainer {...props} showTargetHandle={node?.type !== 'endpoint-node'}>
	{#snippet body()}
		<ContextMenu.Root bind:open={contextIsOpen}>
			<ContextMenu.Trigger>
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
						<!-- <span class="block text-xs whitespace-nowrap">{props.id}</span> -->
					</div>

					<button
						class={[
							'relative flex size-20 items-center justify-center rounded-full border p-2 transition-all',
							selected && 'border-[2px] duration-100 ease-in',
							shape === 'circle' && 'rounded-full',
							shape === 'square' && 'rounded-md',
							selected && node?.type === 'endpoint-node' && 'bg-warning-900/50',
							selected && node?.type === 'action-node' && 'bg-main-600/50',
							selected && node?.type === 'flow-node' && 'bg-accent-900/50',
							borderClass,
							classes
						]}
						ondblclickcapture={openFn}
					>
						{#if icon}
							<span class="custom-node-icon-shadow">{@render icon()}</span>
						{/if}
					</button>
				</div>
			</ContextMenu.Trigger>

			<ContextMenu.Portal>
				<ContextMenu.Content>
					<NodeActions {node} bind:isOpen={contextIsOpen} />
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu.Root>
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
