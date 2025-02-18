<script lang="ts">
	import type { Node, NodeType } from '$lib/types/flow'
	import type { onClickFn } from '$lib/stores/nodeActions.svelte'
	import IconDots from '~icons/material-symbols/more-horiz'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { untrack } from 'svelte'
	import { actionsMap } from '$lib/stores/nodeActions.svelte'

	interface Props {
		node?: Node
	}

	const props: Props = $props()
	const { node } = $derived(props)

	const popoverId = $derived(`actions-${node?.id}`)
	const actions = $derived(actionsMap().get(node?.type as NodeType) ?? [])

	// Flip force close back to false whenever it's set to true
	// This is enough to trigger the close animation
	let forceClose = $state(false)
	$effect(() => {
		if (forceClose) {
			untrack(() => {
				setTimeout(() => (forceClose = false), 150)
			})
		}
	})

	const useSvelteFlow = useSvelteFlowHook()
	const onActionClick = (fn?: onClickFn) => {
		forceClose = true
		fn?.(node!, useSvelteFlow)
	}
</script>

<div class="popover group/popover relative" use:clickOutside>
	<div
		id={popoverId}
		class={[
			'popover peer absolute left-1/2 z-100 m-0 origin-top -translate-x-1/2',
			'rounded-lg bg-zinc-800 p-1 text-sm text-zinc-50 transition-[transform_opacity] duration-200 ease-(--easing-circ)',
			'pointer-events-none scale-75 opacity-0 delay-[30]',
			!forceClose &&
				'group-hover/popover:pointer-events-auto group-hover/popover:block group-hover/popover:scale-100 group-hover/popover:opacity-100'
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

	<!-- This needs to go after so peer works -->
	<button
		class={[
			'absolute bottom-5 left-1/2 grid h-4',
			'-translate-x-1/2 translate-y-1/2 scale-25 place-content-center rounded-md',
			'px-4 py-6 text-xl leading-none font-medium text-zinc-200 opacity-0',
			'transition-[transform_opacity] duration-150 ease-(--easing-circ)',
			!forceClose &&
				'group-hover/container:scale-100 group-hover/container:opacity-70 peer-hover:opacity-100 hover:opacity-100'
		]}
	>
		<IconDots />
	</button>
</div>

<style lang="postcss">
	@starting-style {
		.popover {
			transform: scale(0.75);
			opacity: 0;
		}
	}
</style>
