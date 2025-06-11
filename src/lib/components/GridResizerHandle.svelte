<script lang="ts">
	import { sleep } from '$lib/utils/sleep'

	interface Props {
		name: string
		axis: 'x' | 'y'
		gridContainer: HTMLDivElement
		onResizeEnd?: () => void
		defaultSize?: number
		startSize?: number
		gutterSize?: number
	}

	let {
		name,
		axis,
		gridContainer,
		onResizeEnd,
		defaultSize = 300,
		startSize = 300,
		gutterSize = 10
	}: Props = $props()

	let isResizing = $state(false)

	const MIN_SIZE_THRESHOLD = 80
	const MINIFIED_SIZE = 6

	let currentPanelSize = $state(startSize)

	// Track mouse position and direction
	let lastMouseX = $state(0)
	let lastMouseY = $state(0)
	let direction = $state<'left' | 'right' | 'up' | 'down' | null>(null)

	const isMinified = $derived(currentPanelSize === MINIFIED_SIZE)

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
		if (currentPanelSize < MINIFIED_SIZE) return

		// Calculate direction based on mouse movement
		updateDirection(event)

		axis === 'x' ? resizeX(event) : resizeY(event)

		// Update last mouse position for next calculation
		lastMouseX = event.clientX
		lastMouseY = event.clientY
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
		const containerRect = gridContainer.getBoundingClientRect()
		const containerWidth = containerRect.width

		currentPanelSize = containerRect.right - event.clientX
		console.log(currentPanelSize)

		if (currentPanelSize < MIN_SIZE_THRESHOLD && direction === 'right') {
			transitionToSize(MINIFIED_SIZE)
		} else {
			gridContainer.style.gridTemplateColumns = `1fr ${gutterSize}px ${currentPanelSize}px`
		}

		localStorage.setItem(`${name}Width`, String(currentPanelSize))
	}

	function resizeY(event: MouseEvent) {
		const containerRect = gridContainer.getBoundingClientRect()
		const containerHeight = containerRect.height

		currentPanelSize = containerRect.bottom - event.clientY

		if (currentPanelSize < 100 && direction === 'down') {
			transitionToSize(MINIFIED_SIZE)
		} else {
			gridContainer.style.gridTemplateRows = `1fr ${gutterSize}px ${currentPanelSize}px`
		}

		localStorage.setItem(`${name}Height`, String(currentPanelSize))
	}

	async function resetToDefaultSize() {
		await transitionToSize(defaultSize)
	}

	async function resizeToMin() {
		startSize = currentPanelSize
		await transitionToSize(MINIFIED_SIZE)
	}

	async function transitionToSize(size: number) {
		// Add and then remove the transition class
		// Can't have transitions enabled by default, it will mess with drag-resizing
		gridContainer.classList.add('transition-all', 'duration-300')
		gridContainer.style[axis === 'x' ? 'gridTemplateColumns' : 'gridTemplateRows'] =
			`1fr ${gutterSize}px ${size}px`
		// Let the transition finish
		await sleep(300)
		gridContainer.classList.remove('transition-all', 'duration-300')
		currentPanelSize = size
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
		ondblclick={isMinified ? resetToDefaultSize : resizeToMin}
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
