<script lang="ts">
	import type { Component } from '$lib/types/agent'
	import DescriptionIcon from '~icons/material-symbols/description-rounded'
	import InputIcon from '~icons/material-symbols/input-circle-rounded'
	import ArrowRightIcon from '~icons/material-symbols/arrow-right-alt-rounded'

	interface Props {
		meta: Component['meta']
	}

	const { meta }: Props = $props()

	function handleDragStart(event: DragEvent) {
		if (event.dataTransfer) {
			const isMaybeFlow = meta.name.toLowerCase().includes('flow')
			const preview = document.getElementById(isMaybeFlow ? 'flow-preview' : 'action-preview')!
			event.dataTransfer.setData('text/plain', meta.id)
			event.dataTransfer.setDragImage(preview, 40, 40)
			event.dataTransfer.effectAllowed = 'copy'
		}
	}
</script>

<div
	draggable="true"
	role="listitem"
	ondragstart={handleDragStart}
	class={[
		'bg-main-850 border-main-700/80 rounded-md border px-4 pt-2 pb-3',
		'cursor-grab select-none',
		'transition',
		'hover:border-main-700 hover:bg-main-800'
	]}
>
	<h3 class="text-main-200 mb-2">
		{meta.name}
	</h3>

	<div class="[&_svg]:text-main-300 flex flex-col gap-1 text-sm">
		<div class="text-main-400 flex flex-row gap-2">
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
