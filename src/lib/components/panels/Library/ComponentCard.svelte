<script lang="ts">
	import type { Component } from '$lib/types/agent'
	import DescriptionIcon from '~icons/material-symbols/description-rounded'
	import InputIcon from '~icons/material-symbols/input-circle-rounded'
	import ArrowRightIcon from '~icons/material-symbols/arrow-right-alt-rounded'
	import DragIcon from '~icons/material-symbols/drag-indicator'
	import FlowIcon from '~icons/material-symbols/network-node'
	import ActionIcon from '~icons/mdi/rhombus'

	interface Props {
		component: Component
	}

	const { component }: Props = $props()

	const meta = $derived(component.meta)

	function handleDragStart(event: DragEvent) {
		if (event.dataTransfer) {
			const preview = document.getElementById(
				component.resource === 'flow/v1' ? 'flow-preview' : 'action-preview'
			)!
			event.dataTransfer.setData('text/plain', meta.id)
			event.dataTransfer.setDragImage(preview, 40, 40)
			event.dataTransfer.effectAllowed = 'copy'
		}
	}

	const Icon = $derived(component.resource === 'flow/v1' ? FlowIcon : ActionIcon)
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
	<DragIcon
		class="group-hover/card:text-main-200 text-main-400 mt-1 mr-2 -ml-2 size-4 shrink-0 transition"
	/>

	<div>
		<h3 class="text-main-200 mb-2">
			<Icon
				class={[
					'me-1.5 inline-block size-5 drop-shadow-[0px_0px_7px]',
					component.resource === 'flow/v1'
						? 'text-accent-400 drop-shadow-accent-500'
						: 'text-main-300 drop-shadow-main-300/40'
				]}
			/>
			{meta.name}
		</h3>

		<div class="[&_svg]:text-main-300 ms-0.5 flex flex-col gap-1 text-sm">
			<div class="text-main-400 flex gap-2">
				<DescriptionIcon class="flex-shrink-0" />
				<p class="truncate-lines-2 ms-1 -mt-1">
					{meta.intention?.purpose || 'No purpose defined'}
				</p>
			</div>

			<div class="text-main-400 grid max-w-full grid-cols-[auto_auto] gap-2">
				<p class="truncate">
					<InputIcon class="mr-2 inline-block" />
					{meta.intention?.input || 'No input defined'}
				</p>
				<p class="truncate">
					<ArrowRightIcon class="inline-block" />
					{meta.intention?.output || 'No output defined'}
				</p>
			</div>
		</div>
	</div>
</div>
