<script lang="ts">
	interface Props {
		gridContainer: HTMLDivElement
		onResizeEnd?: () => void
	}

	const { gridContainer, onResizeEnd }: Props = $props()

	let isResizing = $state(false)

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

		const containerRect = gridContainer.getBoundingClientRect()
		const containerWidth = containerRect.width

		const rightColWidth = containerRect.right - event.clientX
		if (rightColWidth < 300) return
		if (rightColWidth > containerWidth / 2 - 8) return

		gridContainer.style.gridTemplateColumns = `1fr 4px ${rightColWidth}px`
	}
</script>

<button
	type="button"
	class="hover:bg-main-500 bg-main-600 my-auto h-10 cursor-ew-resize rounded-full border-0 transition-all hover:h-20"
	onmousedown={handleResize}
	role="slider"
	aria-orientation="horizontal"
	aria-valuenow={450}
	aria-valuemin={200}
	aria-valuemax={800}
	aria-label="Resize panel width"
></button>
