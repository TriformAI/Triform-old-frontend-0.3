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
	// toolbar icons
	import undo_logo from '../icons/undo.svg';
	import redo_logo from '../icons/redo.svg';

	import zoom_in from '../icons/zoom_in.svg';
	import zoom_out from '../icons/zoom_out.svg';
	import fit_screen from '../icons/fit_screen.svg';
	import grid_icon from '../icons/grid_4x4.svg';
	import draw_icon from '../icons/draw.svg';
	import search_icon from '../icons/search.svg';
	import red_remove from '../icons/red_remove.svg';
	import {
		canvasDropdownOpen,
		canvasToolsModal,
		freeFormAutoArrangeModal,
		toggleModal
	} from '../../stores/modals';

	import { iconsStore, toggleIconVisibility } from '../../stores/tools';

	let icons;
	iconsStore.subscribe((value) => {
		icons = value;
	});

	let draggedItemIndex = null;

	const handleDragStart = (index) => {
		draggedItemIndex = index;
	};

	const handleDrop = (index) => {
		if (draggedItemIndex !== null && draggedItemIndex !== index) {
			iconsStore.update((iconList) => {
				// Filter only toolbar icons and get their actual index in the original store
				let toolbarIcons = iconList.filter((icon) => icon.visibleOnToolbar);
				let actualDraggedIndex = iconList.indexOf(toolbarIcons[draggedItemIndex]);
				let actualDropIndex = iconList.indexOf(toolbarIcons[index]);

				// Swap the icons in the store
				[iconList[actualDraggedIndex], iconList[actualDropIndex]] = [
					iconList[actualDropIndex],
					iconList[actualDraggedIndex]
				];

				return [...iconList];
			});
			draggedItemIndex = null;
		}
	};
</script>

<div
	class="flex items-center justify-between w-full py-5 px-7 border-b border-b-[#FFFFFF1A] text-brand-white bg-website-primary"
>
	<!-- Dropdown menu with fade and scale animation -->
	{#if $freeFormAutoArrangeModal}
		<div
			class="absolute top-44 right-20 mt-2 w-72 bg-website-secondary text-brand-white border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
			in:scale={{ start: 0.9, duration: 200 }}
			out:fade={{ duration: 150 }}
		>
			<a
				href=" "
				class="flex items-center px-10 py-4 text-lg rounded-t-lg gap-x-4 hover:bg-website-tertiary"
			>
				<img src={grid_icon} alt="grid_icon" class="inline-block w-6" />
				<p>Freeform</p>
			</a>
			<a
				href=" "
				class="flex items-center px-10 py-4 text-lg rounded-b-lg gap-x-4 hover:bg-website-tertiary"
			>
				<img src={draw_icon} alt="draw_icon" class="inline-block w-6" />
				<p>Auto-Arrange</p>
			</a>
		</div>
	{/if}
	{#if $canvasDropdownOpen}
		<div
			class="absolute left-8 top-44 mt-2 w-80 bg-website-secondary text-[#D1D5DB] border border-[#FFFFFF1A] rounded-lg shadow-lg z-50"
			in:scale={{ start: 0.9, duration: 200 }}
			out:fade={{ duration: 150 }}
		>
			<a
				href=" "
				class="flex items-center px-10 py-4 text-lg rounded-t-lg gap-x-4 hover:bg-website-tertiary"
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

			<button
				on:click={() => {
					toggleModal(canvasToolsModal);
				}}
				class="flex items-center w-full px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
			>
				<img src={canvas_dropdown_10} alt="canvas_dropdown_9" class="inline-block w-6" />
				<p class="flex-shrink-0">Customize Top Bar</p>
			</button>
			<a
				href=" "
				class="flex items-center px-10 py-4 text-lg rounded-b-lg gap-x-4 hover:bg-website-tertiary"
			>
				<img src={canvas_dropdown_10} alt="canvas_dropdown_10" class="inline-block w-6" />
				<p class="flex-shrink-0">Customize Status Bar</p>
			</a>
		</div>
	{/if}
	<!-- Canvas 1 dropdown -->
	<div class="flex items-center gap-x-7">
		<button
			on:click={() => toggleModal(canvasDropdownOpen)}
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
		{#each icons.filter((icon) => icon.visibleOnToolbar) as { id, icon, alt }, index}
			<button
				class={`relative p-2 cursor-pointer hover:bg-website-tertiary ${$canvasToolsModal && 'bg-website-tertiary'} rounded-xl`}
				draggable={$canvasToolsModal ? 'true' : 'false'}
				on:dragstart={$canvasToolsModal ? () => handleDragStart(index) : null}
				on:drop={$canvasToolsModal ? () => handleDrop(index) : null}
				on:dragover={$canvasToolsModal ? (e) => e.preventDefault() : null}
			>
				<img {alt} src={icon} class="w-8" />
				{#if $canvasToolsModal}
					<button
						class="absolute inset-y-0 right-0 top-10"
						on:click={() => toggleIconVisibility(id)}
					>
						<img src={red_remove} alt="minus" class="w-5" />
					</button>
				{/if}
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
		<button
			class="flex items-center ml-6 cursor-pointer"
			on:click={() => toggleModal(freeFormAutoArrangeModal)}
		>
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
		</button>

		<!-- Search Icon -->
		<div class="pl-4 ml-4 border-l-2 border-l-[#FFFFFF1A]">
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={search_icon} alt="search_icon" class="w-8" />
			</div>
		</div>
	</div>
</div>
