<script lang="ts">
	import type { Component } from '$lib/types/resources'
	import IconDescription from '~icons/material-symbols/description-rounded'
	import IconDrag from '~icons/material-symbols/drag-indicator'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconAgent from '~icons/material-symbols/psychology-rounded'
	import IconAction from '~icons/mdi/rhombus'

	interface Props {
		component: Component
	}

	const { component }: Props = $props()

	const meta = $derived(component.meta)

	const nodeType = $derived(component.resource.split('/')[0])

	function handleDragStart(event: DragEvent) {
		if (event.dataTransfer) {
			const preview = document.getElementById(`${nodeType}-preview`)!
			event.dataTransfer.setData('text/plain', component.id)
			event.dataTransfer.setDragImage(preview, 40, 40)
			event.dataTransfer.effectAllowed = 'copy'
		}
	}

	const Icon = $derived.by(() => {
		return {
			flow: IconFlow,
			action: IconAction,
			agent: IconAgent
		}[nodeType]
	})

	const iconClasses = $derived.by(() => {
		return {
			flow: 'text-complement-400 drop-shadow-complement-500',
			action: 'text-main-300 drop-shadow-main-300/40',
			agent: 'text-accent-400 drop-shadow-accent-500'
		}[nodeType]
	})
</script>

<div
	draggable="true"
	role="listitem"
	ondragstart={handleDragStart}
	class={[
		'bg-main-850 border-main-700/80 rounded-md border px-4 pt-2 pb-3',
		'flex flex-row items-start',
		'cursor-grab select-none',
		'group/card transition',
		'hover:border-main-700 hover:bg-main-800'
	]}
>
	<IconDrag
		class="group-hover/card:text-main-200 text-main-400 mt-1 mr-2 -ml-2 size-4 shrink-0 transition"
	/>

	<div>
		<h3 class="text-main-200 mb-2">
			<Icon class={['me-1.5 inline-block size-5 drop-shadow-[0px_0px_7px]', iconClasses]} />
			{meta.name}
		</h3>

		<div class="[&_svg]:text-main-300 ms-0.5 flex flex-col gap-1 text-sm">
			<p class="truncate-lines-2 text-main-400 ms-7 -mt-1">
				{meta.intention || 'No intention'}
			</p>

			<!-- <div class="text-main-400 grid max-w-full grid-cols-[auto_auto] gap-2">
				<p class="truncate">
					<InputIcon class="mr-2 inline-block" />
					{meta.intention?.input || 'No input defined'}
				</p>
				<p class="truncate">
					<ArrowRightIcon class="inline-block" />
					{meta.intention?.output || 'No output defined'}
				</p>
			</div> -->
		</div>
	</div>
</div>
