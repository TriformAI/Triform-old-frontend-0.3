<script lang="ts">
	import type { NodeData, Node } from '$lib/types/flow'
	import { onMount, type Snippet } from 'svelte'
	import NodeActions from './NodeActions.svelte'
	import { useSvelteFlow } from '@xyflow/svelte'

	import NodeContainer from './NodeContainer.svelte'

	import { contextMenus } from '$lib/stores/contextMenu.svelte'

	interface Props {
		id: string
		data: NodeData
		selected: boolean
		icon: Snippet
	}

	const props: Props = $props()

	const { id, data, selected, icon } = $derived(props)

	const { state: nodeState, onOpen } = $derived(data)

	const componentType = $derived(data.spec.resource.split('/')[0])

	const getBorderClass = (nodeState?: string) => {
		switch (nodeState) {
			case 'success':
				return 'border-emerald-500'
			case 'error':
				return 'border-red-500'
			case 'running':
				return 'border-indigo-500'
			default:
				return selected ? 'border-zinc-200' : 'border-zinc-300'
		}
	}

	const { getNode } = useSvelteFlow()
	let node: Node
	onMount(() => {
		const n = getNode(id)
		if (n) node = n as Node
	})

	const openFn = () => {
		if (onOpen) return onOpen()
		// If no open function was defined, use the first context menu action instead
		if (!node?.type) return
		const items = contextMenus.get(node.type)
		items?.[0]?.onClick?.(node)
	}

	let isDeleting = $state(false)
</script>

<NodeContainer {...props}>
	{#snippet body()}
		<div
			class={[
				'node-inner transition-transform duration-200 ease-(--easing-circ)',
				isDeleting ? 'scale-0' : 'scale-100'
			]}
		>
			<div
				class="
						absolute -start-4 top-1/2 -translate-x-full -translate-y-1/2 text-end font-semibold transition
						{selected ? 'text-zinc-200' : 'text-zinc-300'}
					"
			>
				<span class="whitespace-nowrap">{data.component_name}</span>
				<span class="block font-mono text-xs font-bold tracking-wider text-zinc-400 transition">
					v{data.component_version}
				</span>
				<!-- <span
					class="block text-xs font-normal whitespace-nowrap italic transition {selected
						? 'text-zinc-400'
						: 'text-zinc-500'}"
				>
					{id}
				</span> -->
			</div>

			<button
				class="
						relative flex size-20 items-center justify-center rounded-full border p-2 transition-all
						{selected ? 'border-[2px] duration-100 ease-in' : ''}
						{getBorderClass(nodeState)}
					"
				ondblclick={openFn}
			>
				<span class="custom-node-icon-shadow">{@render icon()}</span>
			</button>
		</div>

		<NodeActions {...props} type={componentType} onDelete={() => (isDeleting = true)} {openFn} />
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
			transform: scale(0);
		}
	}
</style>
