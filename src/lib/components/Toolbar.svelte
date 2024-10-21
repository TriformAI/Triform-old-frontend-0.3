<script>
	import { fade, scale } from 'svelte/transition';
	// cavas dropdown icons
	import canvas_dropdown_1 from '../icons/canvas_dropdown_1.svg';
	import canvas_dropdown_2 from '../icons/canvas_dropdown_2.svg';
	import canvas_dropdown_3 from '../icons/canvas_dropdown_3.svg';
	import canvas_dropdown_4 from '../icons/canvas_dropdown_4.svg';
	import canvas_dropdown_5 from '../icons/canvas_dropdown_5.svg';
	import canvas_dropdown_6 from '../icons/canvas_dropdown_6.svg';
	import canvas_dropdown_7 from '../icons/canvas_dropdown_7.svg';
	import canvas_dropdown_8 from '../icons/canvas_dropdown_8.svg';
	import canvas_dropdown_9 from '../icons/canvas_dropdown_9.svg';
	import canvas_dropdown_10 from '../icons/canvas_dropdown_10.svg';

	import undo_logo from '../icons/undo.svg';
	import redo_logo from '../icons/redo.svg';
	import toolbar_icon_1 from '../icons/toolbar_icon_1.svg';
	import toolbar_icon_2 from '../icons/toolbar_icon_2.svg';
	import toolbar_icon_3 from '../icons/toolbar_icon_3.svg';
	import toolbar_icon_4 from '../icons/toolbar_icon_4.svg';
	import toolbar_icon_5 from '../icons/toolbar_icon_5.svg';
	import toolbar_icon_6 from '../icons/toolbar_icon_6.svg';
	import toolbar_icon_7 from '../icons/toolbar_icon_7.svg';
	import zoom_in from '../icons/zoom_in.svg';
	import zoom_out from '../icons/zoom_out.svg';
	import fit_screen from '../icons/fit_screen.svg';
	import grid_icon from '../icons/grid_4x4.svg';
	import draw_icon from '../icons/draw.svg';
	import search_icon from '../icons/search.svg';
	import {canvasDropdownOpen} from '../../stores/modals';

	// toggle dropdown menu
	function toggleCanvasDropdown() {
		canvasDropdownOpen.update((value) => !value);
	}

	let toolbarIcons = [
		{ id: 1, icon: toolbar_icon_1, alt: 'toolbar icon 1' },
		{ id: 2, icon: toolbar_icon_2, alt: 'toolbar icon 2' },
		{ id: 3, icon: toolbar_icon_3, alt: 'toolbar icon 3' },
		{ id: 4, icon: toolbar_icon_4, alt: 'toolbar icon 4' },
		{ id: 5, icon: toolbar_icon_5, alt: 'toolbar icon 5' },
		{ id: 6, icon: toolbar_icon_6, alt: 'toolbar icon 6' },
		{ id: 7, icon: toolbar_icon_7, alt: 'toolbar icon 7' }
	];

	// @ts-ignore
	let draggedItemIndex = null;

	// @ts-ignore
	const handleDragStart = (index) => {
		draggedItemIndex = index;
	};

	// @ts-ignore
	const handleDrop = (index) => {
		// @ts-ignore
		if (draggedItemIndex !== null) {
			// Swap the icons in the array
			const temp = toolbarIcons[index];
			// @ts-ignore
			toolbarIcons[index] = toolbarIcons[draggedItemIndex];
			// @ts-ignore
			toolbarIcons[draggedItemIndex] = temp;
			draggedItemIndex = null;
		}
	};
</script>

<div
	class="flex items-center justify-between w-full py-5 px-7 border-b border-b-[#FFFFFF1A] text-brand-white bg-website-primary"
>
	<!-- Dropdown menu with fade and scale animation -->
	{#if $canvasDropdownOpen}
		<div
			class="absolute left-8 top-44 mt-2 w-80 bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-2xl shadow-lg z-50"
			in:scale={{ start: 0.9, duration: 200 }}
			out:fade={{ duration: 150 }}
		>
			<a
				href=" "
				class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary rounded-t-2xl"
			>
				<img src={canvas_dropdown_1} alt="canvas_dropdown_1" class="inline-block w-6" />
				<p class="flex-shrink-0">Duplicate Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_2} alt="canvas_dropdown_2" class="inline-block w-6" />
				<p class="flex-shrink-0">Clear Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_3} alt="canvas_dropdown_3" class="inline-block w-6" />
				<p class="flex-shrink-0">Rename Canvas</p>
			</a>
			<hr class="border-t-[#FFFFFF1A]" />

			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_4} alt="canvas_dropdown_4" class="inline-block w-6" />
				<p class="flex-shrink-0">New Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_5} alt="canvas_dropdown_5" class="inline-block w-6" />
				<p class="flex-shrink-0">Save Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_6} alt="canvas_dropdown_6" class="inline-block w-6" />
				<p class="flex-shrink-0">Save Canvas As</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_7} alt="canvas_dropdown_7" class="inline-block w-6" />
				<p class="flex-shrink-0">Import Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_8} alt="canvas_dropdown_8" class="inline-block w-6" />
				<p class="flex-shrink-0">Export Canvas</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_9} alt="canvas_dropdown_9" class="inline-block w-6" />
				<p class="flex-shrink-0">Recent Canvas</p>
			</a>
			<hr class="border-t-[#FFFFFF1A]" />

			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary">
				<img src={canvas_dropdown_10} alt="canvas_dropdown_9" class="inline-block w-6" />
				<p class="flex-shrink-0">Customize Top Bar</p>
			</a>
			<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary rounded-b-2xl">
				<img src={canvas_dropdown_10} alt="canvas_dropdown_10" class="inline-block w-6" />
				<p class="flex-shrink-0">Customize Status Bar</p>
			</a>
		</div>
	{/if}
	<!-- Canvas 1 dropdown -->
	<div class="flex items-center gap-x-7">
		<button
			on:click={toggleCanvasDropdown}
			class="flex items-center px-4 py-2 pr-8 border-r-2 cursor-pointer gap-x-3 border-r-[#FFFFFF1A]"
		>
			<h1 class="text-xl">Canvas 1</h1>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</button>

		<!-- Undo Redo -->
		<div class="flex items-center gap-x-4">
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="undo logo" src={undo_logo} class="w-8" />
			</div>
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="redo logo" src={redo_logo} class="w-8" />
			</div>
		</div>
	</div>

	<!-- Central Tools  -->
	<div class="relative flex items-center gap-x-5 left-20">
		{#each toolbarIcons as { id, icon, alt }, index}
			<button
				class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl"
				draggable="true"
				on:dragstart={() => handleDragStart(index)}
				on:drop={() => handleDrop(index)}
				on:dragover={(e) => e.preventDefault()}
			>
				<img {alt} src={icon} class="w-8" />
			</button>
		{/each}
		<div class="p-3.5 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="5"
				stroke="white"
				class="size-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</div>
	</div>

	<!-- Zoom in Zoom out Fit screen -->
	<div class="flex items-center gap-x-5">
		<div class="flex items-center gap-x-5">
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="zoom_in" src={zoom_in} class="w-8" />
			</div>
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="zoom_out" src={zoom_out} class="w-8" />
			</div>
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="fit_screen" src={fit_screen} class="w-8" />
			</div>
		</div>

		<!-- Grid  -->
		<div class="px-8 border-x-2 border-x-[#FFFFFF1A]">
			<div class="p-2 cursor-pointer bg-website-tertiary rounded-xl">
				<img src={grid_icon} alt="grid_icon" class="w-8" />
			</div>
		</div>

		<!-- Draw Search -->
		<div class="flex items-center ml-6 cursor-pointer">
			<img src={draw_icon} alt="draw_icon" class="w-8" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="3"
				stroke="white"
				class="size-4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</div>

		<!-- Search Icon -->
		<div class="pl-4 ml-4 border-l-2 border-l-[#FFFFFF1A]">
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={search_icon} alt="search_icon" class="w-8" />
			</div>
		</div>
	</div>
</div>
