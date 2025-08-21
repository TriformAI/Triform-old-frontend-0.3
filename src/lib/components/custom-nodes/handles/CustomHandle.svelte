<script lang="ts">
	import { getEdges, getNodes, setNodes, setEdges } from '$lib/stores/canvas.svelte'
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'
	import { getNodeSelector } from '$lib/utils/getNodeSelector'
	import type { CanvasNode } from '$lib/types/canvas'
	import type { Handle as HandleType } from '@xyflow/system'
	import AddBox from '~icons/material-symbols/add-box-rounded'
	import { useSvelteFlow } from '@xyflow/svelte'

	interface Props {
		id: string
		position: Position
		type: 'source' | 'target'
		class?: Array<string> | string
		name: string
		nodeId?: string
	}

	const { id, position, type, class: classes, name, nodeId }: Props = $props()

	// The handle is made with a wrapped div so we can add some invisible padding around it
	// so the hitbox for the handle gets bigger

	const top = $derived(position === Position.Top)
	const edges = $derived(getEdges())

	// hide the +button if there's already something connected to this handle
	const hasConnections = $derived(
		edges.length &&
			edges.some(
				e =>
					(type === 'source' && e.source === nodeId && e.sourceHandle === id) ||
					(type === 'target' && e.target === nodeId && e.targetHandle === id)
			)
	)

	// if the node has any connections at all, then we only show the +buttons on hover
	const hasAnyConnections = $derived(
		edges.length && edges.some(e => e.source === nodeId || e.target === nodeId)
	)

	const { screenToFlowPosition } = useSvelteFlow()
	const openNodeSelector = (event: MouseEvent) => {
		if (!nodeId) return

		// Find the current node from the store
		const currentNode = getNodes().find(node => node.id === nodeId) as CanvasNode | undefined
		if (!currentNode) return

		// Position the selector slightly offset from the current node
		const selectorPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY })
		if (type === 'target') selectorPosition.y -= 80

		// Create a handle object matching the Handle type from @xyflow/system
		const handleObj: HandleType = {
			id,
			type,
			position,
			nodeId,
			x: selectorPosition.x,
			y: selectorPosition.y,
			width: 0,
			height: 0
		}

		const { node, edge } = getNodeSelector(nodeId, selectorPosition, currentNode, handleObj)

		// Add the selector node and edge to the stores
		setNodes([...getNodes(), node])
		setEdges([...getEdges(), edge])
	}
</script>

<div
	class={[
		'relative z-10 flex items-center justify-center',
		top ? 'translate-y-full flex-col' : ' -translate-y-full flex-col-reverse'
	]}
>
	{#if !hasConnections}
		<div
			class={[
				top ? '-translate-y-[130%] flex-col' : 'translate-y-[130%] flex-col-reverse',
				'absolute flex items-center',
				hasAnyConnections && 'opacity-0 transition delay-200 group-hover/container:opacity-100'
			]}
		>
			<button
				class="text-main-600 hover:text-main-300 peer px-3 py-1 transition active:scale-95"
				onclick={openNodeSelector}
			>
				<AddBox class="size-5" />
			</button>
			<div class="bg-main-600 peer-hover:bg-main-500 h-4 w-0.5 rounded-full transition"></div>
		</div>
	{/if}
	<span
		class={[
			'text-main-400 bg-main-900/80 -mt-0.5 block h-fit truncate rounded px-1 font-sans text-xs backdrop-blur-sm',
			top ? '-translate-y-full pb-1' : 'translate-y-full pt-1 pb-0.5'
		]}
	>
		{name}
	</span>
	<Handle {id} {type} {position} class={['z-10 !border-none !bg-transparent p-3', classes]}>
		<div
			style="border-color: color-mix(in oklab, var(--node-color) 80%, transparent)"
			class="bg-main-950/80 pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
		></div>
	</Handle>
</div>
