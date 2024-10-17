<script>
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
</script>

<div
	class="flex items-center justify-between w-full py-5 px-7 border-b border-b-[#FFFFFF1A] text-brand-white bg-website-primary"
>
	<!-- Canvas 1 dropdown -->
	<div class="flex items-center gap-x-7">
		<div
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
		</div>

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

	<!-- Central Tools -->
	<div class="relative flex items-center gap-x-5 left-24">
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 1" src={toolbar_icon_1} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 2" src={toolbar_icon_2} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 3" src={toolbar_icon_3} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 4" src={toolbar_icon_4} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 5" src={toolbar_icon_5} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 6" src={toolbar_icon_6} class="w-8" />
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="toolbar icon 7" src={toolbar_icon_7} class="w-8" />
		</div>
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
		<div class="flex items-center gap-x-6">
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
		<div class="px-10 border-x-2 border-x-[#FFFFFF1A]">
			<div class="p-2 cursor-pointer bg-website-tertiary rounded-xl">
				<img src={grid_icon} alt="grid_icon" class="w-8" />
			</div>
		</div>

		<!-- Draw Search -->
		<div class="flex items-center cursor-pointer ml-7">
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
