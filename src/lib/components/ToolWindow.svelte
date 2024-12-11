<script>
	import { onMount, onDestroy } from 'svelte';
	import iconUnpinned from '$lib/icons/unpined.svg';
	import iconPinned from '$lib/icons/pined.svg';
	import default_icon from '$lib/icons/Modal_Title_Icon.svg';
	import { fade, scale } from 'svelte/transition';

	let {
		snapMargin = 20,
		initialPosition = { x: 50, y: 50 },
		initialSize = { width: 300, height: 200 }, // Default size
		boundsRef = null, // Reference to the bounding component
		headerIcon = null,
		headerText = null,
		inScale = null,
		outFade = null
	} = $props();

	let selfRef;

	let boundsRect = boundsRef.getBoundingClientRect();
	let position = $state({
		x: initialPosition.x + boundsRect.left,
		y: initialPosition.y + boundsRect.top
	});
	let size = $state({ ...initialSize });
	let isDragging = false;
	let isResizing = false;
	let resizeDirection = null;
	let offset = { x: 0, y: 0 };
	let resizeStartSize = { width: 0, height: 0 };
	let resizeStartPosition = { x: 0, y: 0 };

	let bounds = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

	const calculateBounds = () => {
		const selfRect = selfRef.getBoundingClientRect();
		if (boundsRef) {
			const rect = boundsRef.getBoundingClientRect();
			bounds = {
				left: rect.left,
				top: rect.top,
				right: rect.right - selfRect.width,
				bottom: rect.bottom - selfRect.height
			};
		} else {
			bounds = {
				left: 0,
				top: 0,
				right: window.innerWidth - selfRect.width,
				bottom: window.innerHeight - selfRect.height
			};
		}
	};

	// Dragging
	const handleMouseDown = (event) => {
		isDragging = true;
		offset = {
			x: event.clientX - position.x,
			y: event.clientY - position.y
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	};

	const handleMouseMove = (event) => {
		if (isDragging) {
			position = {
				x: Math.min(Math.max(event.clientX - offset.x, bounds.left), bounds.right),
				y: Math.min(Math.max(event.clientY - offset.y, bounds.top), bounds.bottom)
			};
		} else if (isResizing && resizeDirection) {
			const deltaX = event.clientX - offset.x;
			const deltaY = event.clientY - offset.y;

			if (resizeDirection.includes('right')) {
				size.width = Math.max(100, resizeStartSize.width + deltaX);
			}
			if (resizeDirection.includes('bottom')) {
				size.height = Math.max(100, resizeStartSize.height + deltaY);
			}
			if (resizeDirection.includes('left')) {
				const newWidth = Math.max(100, resizeStartSize.width - deltaX);
				if (newWidth !== size.width) {
					size.width = newWidth;
					position.x = resizeStartPosition.x + deltaX;
				}
			}
			if (resizeDirection.includes('top')) {
				const newHeight = Math.max(100, resizeStartSize.height - deltaY);
				if (newHeight !== size.height) {
					size.height = newHeight;
					position.y = resizeStartPosition.y + deltaY;
				}
			}
		}
	};

	const handleMouseUp = () => {
		isDragging = false;
		isResizing = false;
		resizeDirection = null;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	};

	// Resizing
	const handleResizeMouseDown = (event, direction) => {
		isResizing = true;
		resizeDirection = direction;
		resizeStartSize = { ...size };
		resizeStartPosition = { ...position };
		offset = {
			x: event.clientX,
			y: event.clientY
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	};

	onMount(() => {
		calculateBounds();
		window.addEventListener('resize', calculateBounds);
	});

	onDestroy(() => {
		window.removeEventListener('resize', calculateBounds);
	});

	let isPinned = $state(false);
	function togglePinned() {
		isPinned = !isPinned;
	}
</script>

<div
	in:scale={inScale}
	out:fade={outFade}
	bind:this={selfRef}
	class="modal flex flex-col bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg"
	style="left: {position.x}px; top: {position.y}px; width: {size.width}px; height: {size.height}px; z-index: 10;"
>
	<div
		class="header flex flex-row justify-between px-4 py-4 gap-y-3 border-brand-primary-gray"
		onmousedown={handleMouseDown}
	>
		<div class="flex items-center gap-x-3">
			<img src={headerIcon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-md font-semibold text-left text-white">{headerText}</h3>
		</div>
		{#if isPinned}
			<button type="button" class="w-6 cursor-pointer" onclick={togglePinned} aria-label="Pin">
				<img src={iconPinned} alt="pinned" class="w-6" />
			</button>
		{:else}
			<button type="button" class="w-6 cursor-pointer" onclick={togglePinned} aria-label="Unpin">
				<img src={iconUnpinned} alt="unpinned" class="w-6" />
			</button>
		{/if}
	</div>

	<slot />

	<!-- Resize Handles -->
	<div class="resize-handle right" onmousedown={(e) => handleResizeMouseDown(e, 'right')}></div>
	<div class="resize-handle left" onmousedown={(e) => handleResizeMouseDown(e, 'left')}></div>
	<div class="resize-handle bottom" onmousedown={(e) => handleResizeMouseDown(e, 'bottom')}></div>
	<div
		class="resize-handle bottom-right corner"
		onmousedown={(e) => handleResizeMouseDown(e, 'bottom-right')}
	></div>
	<div
		class="resize-handle bottom-left corner"
		onmousedown={(e) => handleResizeMouseDown(e, 'bottom-left')}
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
