<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { fade, scale } from 'svelte/transition'
	import modal_cross from '$lib/icons/modal_cross.svg'

	let {
		initialPosition = { x: 50, y: 50 },
		initialSize = { width: 300, height: 200 }, // Default size
		boundsRef = null, // Reference to the bounding component
		headerIcon = null,
		headerText = null,
		inScale = { start: 0.9, duration: 200 },
		outFade = { duration: 150 },
		toggleModal,
		children
	} = $props()

	let selfRef: HTMLDivElement

	let boundsRect = boundsRef.getBoundingClientRect()
	let position = $state({
		x: initialPosition.x + boundsRect.left,
		y: initialPosition.y + boundsRect.top
	})
	let size = $state<{ width: number; height: number }>({
		width: initialSize.width,
		height: initialSize.height
	})
	let isDragging = false
	let isResizing = false
	let resizeDirection: 'right' | 'bottom' | 'left' | 'top' | 'bottom-right' | 'bottom-left' | null =
		null
	let offset = { x: 0, y: 0 }
	let resizeStartSize = { width: 0, height: 0 }
	let resizeStartPosition = { x: 0, y: 0 }

	let bounds = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }

	const calculateBounds = () => {
		const selfRect = selfRef.getBoundingClientRect()
		if (boundsRef) {
			const rect = boundsRef.getBoundingClientRect()
			bounds = {
				left: rect.left,
				top: rect.top,
				right: rect.right - selfRect.width,
				bottom: rect.bottom - selfRect.height
			}
		} else {
			bounds = {
				left: 0,
				top: 0,
				right: window.innerWidth - selfRect.width,
				bottom: window.innerHeight - selfRect.height
			}
		}
	}

	// Dragging
	const handleMouseDown = (event: MouseEvent) => {
		isDragging = true
		offset = {
			x: event.clientX - position.x,
			y: event.clientY - position.y
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
	}

	const handleMouseMove = (event: MouseEvent) => {
		if (isDragging) {
			position = {
				x: Math.min(Math.max(event.clientX - offset.x, bounds.left), bounds.right),
				y: Math.min(Math.max(event.clientY - offset.y, bounds.top), bounds.bottom)
			}
		} else if (isResizing && resizeDirection) {
			const deltaX = event.clientX - offset.x
			const deltaY = event.clientY - offset.y

			if (resizeDirection.includes('right')) {
				size.width = Math.max(100, resizeStartSize.width + deltaX)
			}
			if (resizeDirection.includes('bottom')) {
				size.height = Math.max(100, resizeStartSize.height + deltaY)
			}
			if (resizeDirection.includes('left')) {
				const newWidth = Math.max(100, resizeStartSize.width - deltaX)
				if (newWidth !== size.width) {
					size.width = newWidth
					position.x = resizeStartPosition.x + deltaX
				}
			}
			if (resizeDirection.includes('top')) {
				const newHeight = Math.max(100, resizeStartSize.height - deltaY)
				if (newHeight !== size.height) {
					size.height = newHeight
					position.y = resizeStartPosition.y + deltaY
				}
			}
		}
	}

	const handleMouseUp = () => {
		isDragging = false
		isResizing = false
		resizeDirection = null
		window.removeEventListener('mousemove', handleMouseMove)
		window.removeEventListener('mouseup', handleMouseUp)
	}

	// Resizing
	const handleResizeMouseDown = (event: MouseEvent, direction: string) => {
		isResizing = true
		resizeDirection = direction as
			| 'right'
			| 'bottom'
			| 'left'
			| 'top'
			| 'bottom-right'
			| 'bottom-left'
		resizeStartSize = { ...size }
		resizeStartPosition = { ...position }
		offset = {
			x: event.clientX,
			y: event.clientY
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
	}

	onMount(() => {
		calculateBounds()
		window.addEventListener('resize', calculateBounds)
	})

	onDestroy(() => {
		window.removeEventListener('resize', calculateBounds)
	})
</script>

<div
	in:scale={inScale}
	out:fade={outFade}
	bind:this={selfRef}
	class="flex flex-col border rounded-lg shadow-lg modal bg-website-secondary text-brand-tertiary-gray border-brand-primary-gray"
	style="left: {position.x}px; top: {position.y}px; width: {size.width}px; height: {size.height}px; z-index: 10;"
>
	<div
		class="flex flex-row justify-between px-4 py-4 header gap-y-3 border-brand-primary-gray"
		onmousedown={handleMouseDown}
		role="button"
		aria-label="Drag"
		tabindex="0"
	>
		<div class="flex items-center gap-x-3">
			<img src={headerIcon} alt="modal_title_icon" class="w-6" />
			<h3 class="font-semibold text-left text-white text-md">{headerText}</h3>
		</div>
		<button type="button" class="relative cursor-pointer w-9 left-4" onclick={toggleModal}>
			<img src={modal_cross} alt="Close modal" class="w-6" />
		</button>
	</div>

	{@render children?.()}

	<!-- Resize Handles -->
	<div
		class="resize-handle right"
		role="button"
		aria-label="Resize right"
		tabindex="0"
		onmousedown={e => handleResizeMouseDown(e, 'right')}
	></div>
	<div
		class="resize-handle left"
		role="button"
		aria-label="Resize left"
		tabindex="0"
		onmousedown={e => handleResizeMouseDown(e, 'left')}
	></div>
	<div
		class="resize-handle bottom"
		role="button"
		aria-label="Resize bottom"
		tabindex="0"
		onmousedown={e => handleResizeMouseDown(e, 'bottom')}
	></div>
	<div
		class="resize-handle bottom-right corner"
		role="button"
		aria-label="Resize bottom-right"
		tabindex="0"
		onmousedown={e => handleResizeMouseDown(e, 'bottom-right')}
	></div>
	<div
		class="resize-handle bottom-left corner"
		role="button"
		aria-label="Resize bottom-left"
		tabindex="0"
		onmousedown={e => handleResizeMouseDown(e, 'bottom-left')}
	></div>
</div>

<style>
	:global(:root) {
		--resize-handle-width: 5px;
	}
	.modal {
		position: absolute;
		overflow: hidden;
		user-select: none;
	}

	.header {
		cursor: initial;
	}

	.resize-handle {
		position: absolute;
		background: transparent;
		z-index: 65;
	}

	.resize-handle:hover {
		background: rgba(255, 255, 255, 0.0625);
	}

	.resize-handle.right {
		cursor: e-resize;
		top: 0;
		right: 0;
		bottom: 0;
		width: var(--resize-handle-width);
	}

	.resize-handle.left {
		cursor: w-resize;
		top: 0;
		left: 0;
		bottom: 0;
		width: var(--resize-handle-width);
	}

	.resize-handle.bottom {
		cursor: s-resize;
		left: 0;
		right: 0;
		bottom: 0;
		height: var(--resize-handle-width);
	}

	.resize-handle.corner {
		width: var(--resize-handle-width);
		height: var(--resize-handle-width);
	}

	.resize-handle.bottom-right {
		cursor: se-resize;
		right: 0;
		bottom: 0;
	}

	.resize-handle.bottom-left {
		cursor: sw-resize;
		left: 0;
		bottom: 0;
	}
</style>
