<script lang="ts">
	import type { Snippet } from 'svelte'

	import Button from '../atoms/Button.svelte'

	import IconClose from '~icons/mdi/close'
	import IconDrag from '~icons/mdi/drag'

	interface Props {
		header?: Snippet
		body: Snippet
		footer?: Snippet
		padding?: 'default' | 'tight'
		isDragging: boolean
		onClose?: () => void
		onDragStart?: (e: MouseEvent) => void
		onDragEnd?: (e: MouseEvent) => void
	}

	let {
		header,
		body,
		footer,
		padding = 'default',
		isDragging = $bindable(false),
		onClose,
		onDragStart: onDragStartProp,
		onDragEnd: onDragEndProp
	}: Props = $props()

	const isDraggable = typeof onDragStartProp === 'function' || typeof onDragEndProp === 'function'

	const onDragStart = (e: MouseEvent) => {
		onDragStartProp?.(e)
		window.addEventListener('mouseup', onDragEnd)
		isDragging = true
	}
	const onDragEnd = (e: MouseEvent) => {
		onDragEndProp?.(e)
		window.removeEventListener('mouseup', onDragEnd)
		isDragging = false
	}
</script>

<div
	class={[
		'border-main-800 bg-main-850 text-main-200 relative grid h-full min-h-fit w-full min-w-fit overflow-hidden rounded-md border',
		'grid-rows-[auto_1fr]'
	]}
>
	<div
		class="bg-main-850 flex flex-row items-center justify-between rounded-t-md border border-x-0 border-t-0 border-b border-inherit pr-4"
	>
		<div
			class={[
				'flex w-full items-center gap-1 font-medium',
				padding === 'default' && 'px-5 py-4',
				padding === 'tight' && 'px-4 py-3',
				isDraggable && 'cursor-grab select-none',
				isDraggable && isDragging ? 'cursor-grabbing' : 'cursor-grab'
			]}
			onmousedown={onDragStart}
			role={isDraggable ? 'dialog' : undefined}
			aria-label={isDraggable ? 'Drag' : ''}
		>
			{#if isDraggable}
				<IconDrag class="h-[1.25rem] w-[1.25rem] opacity-50" />
			{/if}
			{@render header?.()}
		</div>

		{#if typeof onClose === 'function'}
			<Button variation="link" class={padding === 'tight' ? '-me-3' : '-me-0.5'} onClick={onClose}>
				{#snippet icon()}
					<IconClose />
				{/snippet}
			</Button>
		{/if}
	</div>

	<div
		class={[
			'grid w-full',
			padding === 'default' && 'px-5 py-5',
			padding === 'tight' && 'px-4 py-4'
		]}
	>
		{@render body()}
	</div>

	{#if footer}
		<div class="border border-inherit">
			{@render footer()}
		</div>
	{/if}
</div>
