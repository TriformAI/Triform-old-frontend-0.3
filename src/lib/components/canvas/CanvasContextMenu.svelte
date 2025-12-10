<script lang="ts">
	import { canvasActions, type CanvasActionItem } from '$lib/stores/nodeActions.svelte'
	import ContextMenuList from '../atoms/ContextMenuList.svelte'
	import { Portal } from 'bits-ui'
	import { type useSvelteFlow } from '@xyflow/svelte'
	import { clickOutside } from '$lib/utils/clickOutside'

	let {
		x,
		y,
		isOpen = $bindable(false),
		useSvelteFlow: useSvelteFlowHook
	}: {
		x: number
		y: number
		isOpen: boolean
		useSvelteFlow: ReturnType<typeof useSvelteFlow>
	} = $props()

	const actions = $derived(canvasActions())

	const handleActionClick = async (fn: CanvasActionItem['onClick']) => {
		const { screenToFlowPosition } = useSvelteFlowHook
		const position = screenToFlowPosition({ x, y })
		await fn(position)
		isOpen = false
	}
</script>

<Portal>
	{#if isOpen}
		<div
			class="absolute"
			style="top: {y}px; left: {x}px;"
			use:clickOutside={{ handler: () => (isOpen = false), eventType: 'mousedown' }}
		>
			<ContextMenuList {actions} onActionClick={handleActionClick} />
		</div>
	{/if}
</Portal>
