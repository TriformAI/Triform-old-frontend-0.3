<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { Window } from '$lib/stores/windows.svelte'

	import { closeWindowById, updateWindowById, bringWindowToFront } from '$lib/stores/windows.svelte'
	import Card from './Card.svelte'
	import { onMount, onDestroy } from 'svelte'

	interface Props {
		header?: Snippet
		body: Snippet
		footer?: Snippet
		padding?: 'default' | 'tight'
		onClose?: () => void
		posX: Window['posX']
		posY: Window['posY']
		id: Window['id']
		width: Window['width']
		height: Window['height']
		zIndex: Window['zIndex']
		// customProps: Window['customProps']
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
		zIndex = 1
		// customProps
	}: Props = $props()

	let element: HTMLDivElement
	let hasResized = $state(false)
	let resizeObserver: ResizeObserver
	let isDragging = $state(false)

	const onClose = () => {
		closeWindowById(id)
		onCloseProp?.()
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
		'animate-fade-in absolute resize overflow-auto transition-transform duration-150',
		isDragging ? 'shadow-window-lg scale-[1.015]' : 'shadow-window scale-100'
	]}
	style={`
		top: ${posY}%;
		left: ${posX}%;
		z-index: ${zIndex};
		width: ${hasResized ? `${width}px` : 'auto'};
		height: ${hasResized ? `${height}px` : 'auto'};
		min-width: fit-content;
		min-height: fit-content;
	`}
	bind:this={element}
>
	<Card bind:isDragging {header} {body} {footer} {padding} {onClose} {onDragStart} {onDragEnd} />
</div>
