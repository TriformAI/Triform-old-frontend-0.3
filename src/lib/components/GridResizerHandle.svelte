<script lang="ts">
	import { sleep } from '$lib/utils/sleep'

	interface Props {
		name: string
		axis: 'x' | 'y'
		gridContainer: HTMLDivElement
		onResizeEnd?: () => void
		defaultSize?: number
		startSize?: number
	}

	const {
		name,
		axis,
		gridContainer,
		onResizeEnd,
		defaultSize = 300,
		startSize = 300
	}: Props = $props()

	let isResizing = $state(false)

	const MIN_SIZE_THRESHOLD = 70
	const MINIFIED_SIZE = 6

	let currentSize = $state(startSize)

	const isMinified = $derived(currentSize === MINIFIED_SIZE)

	function handleResize(_event: MouseEvent) {
		isResizing = true
		document.addEventListener('mousemove', resize)
		document.addEventListener('mouseup', () => {
			onResizeEnd?.()

			isResizing = false
			document.removeEventListener('mousemove', resize)
		})
	}

	function resize(event: MouseEvent) {
		if (!isResizing || !gridContainer) return
		if (currentSize < MIN_SIZE_THRESHOLD - 10) return

		axis === 'x' ? resizeX(event) : resizeY(event)
	}

	function resizeX(event: MouseEvent) {
		const containerRect = gridContainer.getBoundingClientRect()
		const containerWidth = containerRect.width

		currentSize = containerRect.right - event.clientX

		// Prevent going above max width
		if (currentSize > containerWidth / 2 - 8) return

		if (currentSize < MIN_SIZE_THRESHOLD) {
			transitionToSize(MINIFIED_SIZE)
		} else {
			gridContainer.style.gridTemplateColumns = `1fr 4px ${currentSize}px`
		}

		localStorage.setItem(`${name}Width`, String(currentSize))
	}

	function resizeY(event: MouseEvent) {
		const containerRect = gridContainer.getBoundingClientRect()
		const containerHeight = containerRect.height

		currentSize = containerRect.bottom - event.clientY

		// Prevent going above max width
		if (currentSize > containerHeight / 2 - 8) return

		if (currentSize < 100) {
			transitionToSize(MINIFIED_SIZE)
		} else {
			gridContainer.style.gridTemplateRows = `1fr 4px ${currentSize}px`
		}

		localStorage.setItem(`${name}Height`, String(currentSize))
	}

	async function resetToDefaultSize() {
		await transitionToSize(defaultSize)
	}

	async function resizeToMin() {
		await transitionToSize(MIN_SIZE_THRESHOLD * 2)
	}

	async function transitionToSize(size: number) {
		// Add and then remove the transition class
		// Can't have transitions enabled by default, it will mess with drag-resizing
		gridContainer.classList.add('transition-all', 'duration-300')
		gridContainer.style[axis === 'x' ? 'gridTemplateColumns' : 'gridTemplateRows'] =
			`1fr 4px ${size}px`
		// Let the transition finish
		await sleep(300)
		gridContainer.classList.remove('transition-all', 'duration-300')
		currentSize = size
	}
</script>

<span
	class={[
		'hover:bg-main-500 bg-main-600 rounded-full border-0 transition-all duration-1000 ease-(--easing-spring)',
		axis === 'x' && 'row-span-3 my-auto h-20 hover:h-30',
		axis === 'y' && 'mx-auto w-20 hover:w-30'
	]}
>
	<button
		onclick={() => {
			if (currentSize <= MIN_SIZE_THRESHOLD) {
				resizeToMin()
			}
		}}
		ondblclick={resetToDefaultSize}
		onmousedown={handleResize}
		type="button"
		aria-label={axis === 'x' ? 'Resize panel width' : 'Resize panel height'}
		class={[
			'h-full w-full',
			axis === 'x' && `scale-x-600 ${isMinified ? 'cursor-pointer' : 'cursor-ew-resize'}`,
			axis === 'y' &&
				`-translate-y-3.5 scale-y-600 ${isMinified ? 'cursor-pointer' : 'cursor-ns-resize'}`
		]}
	></button>
</span>
