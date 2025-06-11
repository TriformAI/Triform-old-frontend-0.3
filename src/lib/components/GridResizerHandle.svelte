<script lang="ts">
	import { sleep } from '$lib/utils/sleep'

	interface Props {
		name: string
		axis: 'x' | 'y'
		gridContainer: HTMLDivElement
		onResizeEnd?: () => void
		size: number
		gutterSize?: number
	}

	let {
		name,
		axis,
		gridContainer,
		onResizeEnd,
		size = $bindable(),
		gutterSize = 10
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

	const isMinified = $derived(size <= TEASE_SIZE)

	function handleResize(event: MouseEvent) {
		isResizing = true

		// Initialize the starting mouse position
		lastMouseX = event.clientX
		lastMouseY = event.clientY
		direction = null

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
		if (size < MINIFIED_SIZE) return

		// Calculate direction based on mouse movement
		updateDirection(event)

		axis === 'x' ? resizeX(event) : resizeY(event)

		// Update last mouse position for next calculation
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
		if (size < MIN_SIZE_THRESHOLD && direction === 'right') {
			transitionToSize(MINIFIED_SIZE)
		} else {
			const containerRect = gridContainer.getBoundingClientRect()
			size = containerRect.right - event.clientX
		}
	}

	function resizeY(event: MouseEvent) {
		if (size < 100 && direction === 'down') {
			transitionToSize(MINIFIED_SIZE)
		} else {
			const containerRect = gridContainer.getBoundingClientRect()
			size = containerRect.bottom - event.clientY
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
				`-translate-y-3.5 scale-y-600 ${isResizing ? 'hover:cursor-grabbing' : 'hover:cursor-ns-resize'}`
		]}
	></button>
</span>
