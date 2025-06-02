<script lang="ts">
	import ContextMenu from '$lib/components/atoms/ContextMenu.svelte'
	import { getNodes, getCurrentFlow, drafts } from '$lib/stores/canvas.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import type { Node, NodeData } from '$lib/types/flow'
	import type { Snippet } from 'svelte'

	import NodeActions from './NodeActions.svelte'
	import NodeContainer from './NodeContainer.svelte'
	import compare from 'just-compare'
	import InnerNode from './InnerNode.svelte'

	interface Props {
		type: 'action' | 'flow'
		id: Node['id']
		data: NodeData
		selected: boolean
		icon?: Snippet
		shape: 'circle' | 'square'
		class?: string
	}

	const props: Props = $props()

	const {
		id,
		data,
		selected,
		icon,
		shape = 'circle',
		class: classes,
		type
	}: Props = $derived(props)

	const node = $derived(getNodes().find(node => node.id === id))

	const openFn = () => {
		// Whenever a node is double clicked, run the first action menu item
		if (!node?.type) return
		const actions = getActions(node.type)
		actions?.filter(a => !a.isDangerous)[0]?.onClick?.(node)
	}

	let contextIsOpen = $state(false)

	const isRootLevelAndFlowNode = $derived(!getCurrentFlow() && node?.type === 'flow-node')

	let showTargetHandle = $derived.by(() => {
		return node?.type !== 'endpoint-node' && !isRootLevelAndFlowNode
	})

	let showSourceHandle = $derived.by(() => {
		return !isRootLevelAndFlowNode
	})

	const draftData = $derived(drafts[data.trinode.spec.meta.id])
	const isDirty = $derived(!compare(data.trinode.spec, draftData))
</script>

<NodeContainer {...props} {showTargetHandle} {showSourceHandle}>
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
							' absolute -inset-x-[25%] -top-1  -translate-y-full truncate rounded py-0.5 text-center text-sm font-semibold transition',
							selected ? 'text-main-300' : 'text-main-400'
						]}
					>
						<span
							class={['bg-main-900 text-main-200 inline-flex items-center gap-1 whitespace-nowrap']}
						>
							{draftData?.meta.name}
							<span
								class={[
									'bg-warning-600 block size-1.5 -translate-y-0.5 rounded-full transition-transform',
									isDirty ? 'scale-100' : 'scale-0'
								]}
							></span>
						</span>
					</div>

					<InnerNode {openFn} {selected} {type} />
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
