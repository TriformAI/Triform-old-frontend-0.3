<script lang="ts">
	import type { CanvasNode } from '$lib/types/canvas'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'

	import { getActions } from '$lib/stores/nodeActions.svelte'

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

<div
	data-node-actions
	class={[
		'bg-main-850 text-main-50 shadow-window origin-top-left scale-100 rounded-lg p-1 text-sm opacity-100 transition-all duration-300'
	]}
>
	<div class="grid">
		{#each actions as action}
			<button
				onclick={() => handleActionClick(action.onClick)}
				type="button"
				class={['list-btn', action.isDangerous && 'list-btn--danger']}
			>
				<action.icon class="size-5.5" />

				{action.label}
			</button>
		{/each}
	</div>
</div>

<style>
	[data-node-actions] {
		@starting-style {
			transform: scale(0.9);
			opacity: 0;
		}
	}
</style>
