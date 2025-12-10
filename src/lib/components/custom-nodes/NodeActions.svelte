<script lang="ts">
	import type { CanvasNode } from '$lib/types/canvas'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import { getActions } from '$lib/stores/nodeActions.svelte'
	import ContextMenuList from '$lib/components/atoms/ContextMenuList.svelte'

	interface Props {
		node?: CanvasNode
		onActionClick?: () => void
	}

	let { node, onActionClick }: Props = $props()

	const actions = $derived(getActions(node?.type!))

	const handleActionClick = (fn: onClickFn) => {
		onActionClick?.()
		fn(node!)
	}
</script>

<ContextMenuList {actions} onActionClick={handleActionClick} />
