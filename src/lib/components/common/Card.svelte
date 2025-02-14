<script lang="ts">
	import type { Snippet } from 'svelte'

	import Button from '../atoms/Button.svelte'

	import IconClose from '~icons/mdi/close'
	import IconDrag from '~icons/mdi/drag'

	const {
		header,
		body,
		footer,
		onClose,
		onDragStart: onDragStartProp,
		onDragEnd: onDragEndProp
	}: {
		header?: Snippet
		body: Snippet
		footer?: Snippet
		onClose?: () => void
		onDragStart?: (e: MouseEvent) => void
		onDragEnd?: (e: MouseEvent) => void
	} = $props()

	const isDraggable = typeof onDragStartProp === 'function' || typeof onDragEndProp === 'function'

	const onDragStart = (e: MouseEvent) => {
		onDragStartProp?.(e)
		window.addEventListener('mouseup', onDragEnd)
	}
	const onDragEnd = (e: MouseEvent) => {
		onDragEndProp?.(e)
		window.removeEventListener('mouseup', onDragEnd)
	}
</script>

<div
	class="relative h-full min-h-fit w-full min-w-fit overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 shadow-lg"
>
	<div
		class="flex flex-row items-center justify-between rounded-t-md border border-x-0 border-t-0 border-b border-inherit bg-zinc-800 pr-4"
	>
		<div
			class="text-md flex w-full flex-row items-center gap-3 px-6 py-5 text-left font-semibold text-zinc-50 {isDraggable
				? 'cursor-move select-none'
				: ''}"
			onmousedown={onDragStart}
			role={isDraggable ? 'dialog' : undefined}
			aria-label={isDraggable ? 'Drag' : ''}
		>
			{#if isDraggable}
				<IconDrag class="h-[1.25rem] w-[1.25rem]" />
			{/if}
			{@render header?.()}
		</div>
		{#if typeof onClose === 'function'}
			<Button variation="link" onClick={onClose}>
				{#snippet icon()}
					<IconClose />
				{/snippet}
			</Button>
		{/if}
	</div>
	<div class="h-auto min-h-fit w-full px-6 py-5">
		{@render body()}
	</div>
	{#if footer}
		<div class="border border-inherit">
			{@render footer()}
		</div>
	{/if}
</div>
