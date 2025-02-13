<script lang="ts">
	import { nodes, edges } from '$lib/stores/canvas.svelte'
	import { removeNode, addDownstreamNode } from '$lib/stores/canvas.svelte'
	import type { Uuid } from '$lib/types/agent'
	import IconTrash from '~icons/material-symbols/delete-outline'
	import IconAdd from '~icons/material-symbols/add-diamond-outline'
	import IconEditor from '~icons/material-symbols/code-blocks-outline'
	import IconDots from '~icons/material-symbols/more-horiz'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { useSvelteFlow } from '@xyflow/svelte'

	const { setCenter, getZoom } = useSvelteFlow()

	interface Props {
		id: Uuid
		positionAbsoluteX: number
		positionAbsoluteY: number
		type: string
		onDelete: VoidFunction
		openFn: VoidFunction
	}

	const props: Props = $props()
	const { id, positionAbsoluteX, positionAbsoluteY, type, onDelete, openFn } = $derived(props)

	const popoverId = $derived(`actions-${id}`)

	let isOpen = $state(false)

	function addSelectorNode() {
		const x = positionAbsoluteX - 88
		const y = positionAbsoluteY + 100

		const newId = self.crypto.randomUUID()

		$nodes = [
			...$nodes,
			{
				id: newId,
				type: 'selector-node',
				position: { x, y },
				data: {
					source_id: id
				}
			}
		]

		$edges = [
			...$edges,
			{
				id: `${id}:${newId}`,
				source: id,
				target: newId
			}
		]
	}

	function initDelete() {
		isOpen = false
		onDelete()
		setTimeout(() => removeNode(id), 500)
	}

	function initAdd(e: MouseEvent) {
		e.stopPropagation()
		isOpen = false
		addDownstreamNode('root', undefined, id)

		setTimeout(() => {
			const pos = $nodes[$nodes.length - 1].position
			if (pos) {
				const currentZoom = getZoom()
				setCenter(pos.x + 40, pos.y + 100, { zoom: currentZoom, duration: 500 })
			}
		}, 100)
	}

	function openEditor() {
		openFn()
	}

	const actions = [
		{
			icon: IconAdd,
			label: 'Create action',
			trigger: initAdd,
			condition: () => true,
			isDangerous: false
		},
		{
			icon: IconEditor,
			label: 'Open code editor',
			trigger: openEditor,
			condition: () => type === 'action',
			isDangerous: false
		},
		{
			icon: IconTrash,
			label: 'Delete node',
			trigger: initDelete,
			condition: () => type !== 'endpoint',
			isDangerous: true
		}
	]
</script>

<div
	class="popover group/popover relative"
	use:clickOutside
	onclick_outside={() => {
		isOpen = false
	}}
>
	<button
		onclick={() => (isOpen = !isOpen)}
		class="absolute bottom-4 left-1/2 grid h-4 -translate-x-1/2 translate-y-1/2 scale-0 place-content-center rounded-md px-1 leading-none font-medium text-zinc-200 transition-transform delay-50 duration-150 ease-(--easing-circ) group-hover/container:scale-100"
	>
		<IconDots />
	</button>

	<div
		id={popoverId}
		class={[
			'popover absolute left-1/2 z-100 m-0   origin-top -translate-x-1/2 rounded-lg bg-zinc-800 p-1 text-sm text-zinc-50 transition-transform duration-200 ease-(--easing-circ)',
			isOpen ? 'block scale-100' : 'hidden'
		]}
	>
		<div class="grid">
			{#each actions as action}
				{#if action.condition()}
					<button
						onclick={action.trigger}
						type="button"
						class={[
							'flex items-center gap-2 rounded px-3 py-2 whitespace-nowrap transition-colors hover:bg-zinc-900/50',
							action.isDangerous
								? 'text-red-300 hover:text-red-400'
								: 'text-zinc-300 hover:text-zinc-200'
						]}
					>
						<action.icon class="size-5.5" />
						{action.label}
					</button>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style lang="postcss">
	@starting-style {
		.popover {
			transform: scale(0);
		}
	}
</style>
