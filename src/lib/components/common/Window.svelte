<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { Window } from '$lib/stores/windows.svelte'

	import { closeWindowById, updateWindowById, bringWindowToFront } from '$lib/stores/windows.svelte'
	import Card from './Card.svelte'
	import { onMount, onDestroy } from 'svelte'

	interface Props extends Window {
		header?: Snippet
		body: Snippet
		footer?: Snippet
		padding?: 'default' | 'tight'
		disableDrag?: boolean
		onClose?: () => void | Promise<boolean>
	}

	let {
		header,
		body,
		footer,
		padding = 'default',
		onClose: onCloseProp,
		posX = 0,
		posY = 0,
		id,
		width = 0,
		height = 0,
		zIndex = 1,
		isClosing,
		disableDrag = false
		// customProps
	}: Props = $props()

	let element: HTMLDivElement
	let hasResized = $state(false)
	let resizeObserver: ResizeObserver
	let isDragging = $state(false)

	const onClose = async () => {
		const confirmClose = await onCloseProp?.()

		if (confirmClose === false) {
			return
		}

		closeWindowById(id)
	}

	let dragStart = {
		x: 0,
		y: 0
	}

	const onDrag = (e: MouseEvent) => {
		// update the local position first and then push the update to the state
		// Convert the mouse position to percentages
		// We'll have to figure out where on the window the mouse grabbed it, and
		// adjust the relative position accordingly
		let { clientX: x, clientY: y } = e
		const { clientWidth: width, clientHeight: height } = element.parentElement as HTMLElement

		// Correct for grab position
		x -= dragStart.x
		y -= dragStart.y

		// Don't allow the element to go out of bounds
		// 4 is how much we want to allow the element to go out of bounds
		if (x > element.clientWidth / -4 && x + element.clientWidth / 4 < width)
			posX = (x / width) * 100
		if (y > 0 && y + element.clientHeight / 4 < height) posY = (y / height) * 100

		// Update state
		updateWindowById(id, {
			posX,
			posY
		})
	}

	const onDragStart = (e: MouseEvent) => {
		if (disableDrag) return
		window.addEventListener('mousemove', onDrag)

		// Offset within the window
		const { offsetLeft, offsetTop } = element
		dragStart = {
			x: e.clientX - offsetLeft,
			y: e.clientY - offsetTop
		}

		bringWindowToFront(id)
	}

	const onDragEnd = (_e: MouseEvent) => {
		window.removeEventListener('mousemove', onDrag)
	}

	const observeResize = () => {
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				const { width: newWidth, height: newHeight } = entry.contentRect

				// Ignore insignificant changes caused by the dropdown
				if (Math.abs(newWidth - width) < 10 && Math.abs(newHeight - height) < 10) {
					continue
				}

				// Update only if the window is actually being resized
				if (!hasResized) {
					hasResized = true
				}

				// Update the dimensions
				width = newWidth
				height = newHeight

				// Persist the dimensions in the state store
				updateWindowById(id, { width: newWidth, height: newHeight })
			}
		})

		resizeObserver.observe(element)
	}

	onMount(() => {
		observeResize()
	})

	onDestroy(() => {
		resizeObserver?.disconnect()
	})
</script>

<div
	class={[
		'window',
		'absolute max-h-[80vh] max-w-screen resize overflow-auto transition duration-150',
		isDragging && !disableDrag ? 'shadow-window-lg scale-[1.015]' : 'shadow-window',
		isClosing ? 'scale-90 opacity-0' : 'opacity-100'
	]}
	style={`
		top: ${posY}%;
		left: ${posX}%;
		z-index: ${zIndex};
		width: ${hasResized ? `${width}px` : 'auto'};
		height: ${hasResized ? `${height}px` : 'auto'};
		min-width: min-content;
		min-height: fit-content;
		transition-property: opacity scale;
	`}
	bind:this={element}
>
	<Card bind:isDragging {header} {body} {footer} {padding} {onClose} {onDragStart} {onDragEnd} />
</div>

<style>
	@starting-style {
		.window {
			transform: scale(0.75);
			opacity: 0;
		}
	}
</style>
