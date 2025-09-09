<script lang="ts">
	import { sleep } from '$lib/utils/sleep'

	interface Props {
		name: string
		axis: 'x' | 'y'
		gridContainer: HTMLDivElement
		onResizeEnd?: () => void
		size: number
		gutterSize?: number
		side?: 'left' | 'right' | 'top' | 'bottom'
	}

	let {
		name,
		axis,
		gridContainer,
		onResizeEnd,
		size = $bindable(),
		gutterSize = 10,
		side = 'right'
	}: Props = $props()

	const DEFAULT_SIZE = axis === 'x' ? 500 : 200

	let isResizing = $state(false)
	let isTransitioning = $state(false)

	let lastDraggedSize = $state(size || DEFAULT_SIZE)

	const MIN_SIZE_THRESHOLD = 80
	const MINIFIED_SIZE = 6
	const TEASE_SIZE = 14

	// Track mouse position and direction
	let lastMouseX = $state(0)
	let lastMouseY = $state(0)
	let direction = $state<'left' | 'right' | 'up' | 'down' | null>(null)
	let initialContainerRect = $state<DOMRect>()

	const isMinified = $derived(size <= TEASE_SIZE)

	function handleResize(event: MouseEvent) {
		isResizing = true
		lastMouseX = event.clientX
		lastMouseY = event.clientY
		direction = null

		// Freeze the starting rect
		initialContainerRect = gridContainer.getBoundingClientRect()

		document.addEventListener('mousemove', resize)
		document.addEventListener('mouseup', () => {
			onResizeEnd?.()
			isResizing = false
			direction = null
			document.removeEventListener('mousemove', resize)
		})
	}

	function resize(event: MouseEvent) {
		if (!isResizing || !gridContainer) return

		updateDirection(event)

		axis === 'x' ? resizeX(event) : resizeY(event)

		lastMouseX = event.clientX
		lastMouseY = event.clientY
		lastDraggedSize = size

		persistSize()
	}

	function updateDirection(event: MouseEvent) {
		const deltaX = event.clientX - lastMouseX
		const deltaY = event.clientY - lastMouseY

		if (axis === 'x') {
			// For horizontal resizing, set left or right
			if (Math.abs(deltaX) > 2) {
				// Add small threshold to avoid jitter
				direction = deltaX > 0 ? 'right' : 'left'
			}
		} else {
			// For vertical resizing, set up or down
			if (Math.abs(deltaY) > 2) {
				// Add small threshold to avoid jitter
				direction = deltaY > 0 ? 'down' : 'up'
			}
		}
	}

	function resizeX(event: MouseEvent) {
		const rect = initialContainerRect

		if (side === 'right' && rect) {
			if (size < MIN_SIZE_THRESHOLD && direction === 'right') {
				transitionToSize(MINIFIED_SIZE)
				return
			}
			size = rect.right - event.clientX
		} else if (side === 'left' && rect) {
			if (size < MIN_SIZE_THRESHOLD && direction === 'left') {
				transitionToSize(MINIFIED_SIZE)
				return
			}
			size = event.clientX - rect.left
		}
	}

	function resizeY(event: MouseEvent) {
		const containerRect = gridContainer.getBoundingClientRect()

		if (size < MIN_SIZE_THRESHOLD && direction === 'down') {
			transitionToSize(MINIFIED_SIZE)
		} else {
			if (side === 'bottom') {
				size = containerRect.bottom - event.clientY
			} else if (side === 'top') {
				size = event.clientY - containerRect.top
			}
		}
	}

	function persistSize() {
		localStorage.setItem(`${name}${axis === 'x' ? 'Width' : 'Height'}`, String(size))
	}

	async function resetToOpen() {
		await transitionToSize(lastDraggedSize > MIN_SIZE_THRESHOLD ? lastDraggedSize : DEFAULT_SIZE)
	}

	async function resizeToMin() {
		size = MINIFIED_SIZE
		await transitionToSize(MINIFIED_SIZE)
	}

	async function transitionToSize(targetSize: number, saveAsCurrent = true) {
		isTransitioning = true
		// Add and then remove the transition class
		// Can't have transitions enabled by default, it will mess with drag-resizing
		gridContainer.classList.add('transition-all', 'duration-500')
		size = targetSize

		onResizeEnd?.()

		// Let the transition finish
		await sleep(500)

		gridContainer.classList.remove('transition-all', 'duration-500')
		isTransitioning = false

		persistSize()
	}
</script>

<span
	class={[
		'hover:bg-main-500 bg-main-600 relative z-50 mx-auto my-auto rounded-full border-0 transition-all duration-1000 ease-(--easing-spring)',
		axis === 'x' && 'row-span-3 h-20  w-1 hover:h-30',
		axis === 'y' && 'mx-auto h-1 w-20 hover:w-30'
	]}
>
	<button
		data-grid-handle-name={name}
		data-is-minified={isMinified}
		onmouseenter={() => {
			if (isMinified) {
				transitionToSize(TEASE_SIZE, false)
			}
		}}
		onmouseleave={async () => {
			if (size === TEASE_SIZE && !isTransitioning) {
				resizeToMin()
			}
		}}
		ondblclick={isMinified ? resetToOpen : resizeToMin}
		onmousedown={handleResize}
		type="button"
		aria-label={axis === 'x' ? 'Resize panel width' : 'Resize panel height'}
		class={[
			'h-full w-full',
			axis === 'x' &&
				`scale-x-600 ${isResizing ? 'hover:cursor-grabbing' : 'hover:cursor-ew-resize'}`,
			axis === 'y' &&
				`scale-y-600 ${isResizing ? 'hover:cursor-grabbing' : 'hover:cursor-ns-resize'}`
		]}
	></button>
</span>
