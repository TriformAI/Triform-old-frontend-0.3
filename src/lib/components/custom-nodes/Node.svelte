<script lang="ts">
	import ContextMenu from '$lib/components/atoms/ContextMenu.svelte'
	import { getNodes } from '$lib/stores/canvas.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import type { Node, NodeData } from '$lib/types/canvas'
	import type { Snippet } from 'svelte'
	import NodeActions from './NodeActions.svelte'
	import NodeContainer from './NodeContainer.svelte'
	import InnerNode from './InnerNode.svelte'

	interface Props {
		type: 'action' | 'flow' | 'agent'
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

	// "messages" should be the first handle for agents
	const sortHandles = (a: string, b: string) => {
		if (type === 'agent') {
			if (a === 'messages') return -1
			if (b === 'messages') return 1
		}
		return 0
	}
	const targetHandles = $derived(Object.keys(data.trinode.spec.spec.inputs).sort(sortHandles))
	const sourceHandles = $derived(Object.keys(data.trinode.spec.spec.outputs).sort(sortHandles))

	const isLooping = $derived(node?.data?.trinode?.loop?.enabled)
</script>

<NodeContainer {...props} {targetHandles} {sourceHandles} {id}>
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
					{#if isLooping}
						<div class="absolute top-0 left-0">
							<div
								class={[
									'absolute translate-x-3 translate-y-3 opacity-35 transition-all delay-200 duration-700',
									'starting:translate-0 starting:opacity-0'
								]}
							>
								<InnerNode
									{type}
									{selected}
									name={data?.trinode?.spec.meta.name}
									{id}
									{node}
									empty={true}
								/>
							</div>
							<div
								class={[
									'absolute translate-x-1.5 translate-y-1.5 opacity-60 transition-all duration-700',
									'starting:translate-0 starting:opacity-0'
								]}
							>
								<InnerNode
									{type}
									{selected}
									name={data?.trinode?.spec.meta.name}
									{id}
									{node}
									empty={true}
								/>
							</div>
						</div>
					{/if}
					<InnerNode {openFn} {selected} {type} name={data?.trinode?.spec.meta.name} {id} {node} />
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
