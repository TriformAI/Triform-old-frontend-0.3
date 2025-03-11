<script lang="ts">
	import type { Node, NodeType } from '$lib/types/flow'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'

	import { getActions } from '$lib/stores/nodeActions.svelte'

	interface Props {
		node?: Node
		isOpen: boolean
	}

	let { node, isOpen = $bindable() }: Props = $props()

	const actions = $derived(getActions(node?.type!))

	const useSvelteFlow = useSvelteFlowHook()
	const onActionClick = (fn?: onClickFn) => {
		isOpen = false
		fn?.(node!, useSvelteFlow)
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
				onclick={() => onActionClick(action.onClick)}
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
