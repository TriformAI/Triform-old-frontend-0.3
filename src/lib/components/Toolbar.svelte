<script>
	// @ts-nocheck
	import { useSvelteFlow } from '@xyflow/svelte';

	import undo_logo from '$lib/icons/undo.svg';
	import redo_logo from '$lib/icons/redo.svg';

	import zoom_in from '$lib/icons/zoom_in.svg';
	import zoom_out from '$lib/icons/zoom_out.svg';
	import fit_screen from '$lib/icons/fit_screen.svg';
	import grid_icon from '$lib/icons/grid_4x4.svg';
	import draw_icon from '$lib/icons/draw.svg';
	import search_icon from '$lib/icons/search.svg';
	import red_remove from '$lib/icons/red_remove.svg';
	import {
		canvasDropdownOpen,
		canvasToolsModal,
		freeFormAutoArrangeModal,
		toggleModal,
		searchModal,
		componentToolsBoxModal,
		environmentModal,
		tokenModal,
		storageModal,
		templateLibraryModal,
		propertyModal,
		consoleModal
	} from '$lib/stores/modals';

	import { iconsStore, toggleIconVisibility } from '../stores/tools';
	import SearchModals from './modals/SearchModals.svelte';
	import CanvasDropDownModal from './modals/CanvasDropDownModal.svelte';
	import FreeFormAutoArrangeModal from './modals/FreeFormAutoArrangeModal.svelte';
	import ComponentsToolbox from './modals/ComponentsToolbox.svelte';
	import EnvironmentModal from './modals/EnvironmentModal.svelte';
	import TokenModal from './modals/TokenModal.svelte';
	import StorageModal from './modals/StorageModal.svelte';
	import TemplateLibaryModal from './modals/TemplateLibaryModal.svelte';
	import PropertyModal from './modals/PropertyModal.svelte';
	import ConsoleModal from './modals/ConsoleModal.svelte';

	const { zoomOut, zoomIn, fitView } = useSvelteFlow();

	let icons = $state();
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
	class="flex items-center justify-between w-full py-2 border-b px-7 border-b-brand-primary-gray text-brand-white bg-website-primary"
>
	<!-- Dropdown menu with fade and scale animation -->

	{#each [{ condition: $freeFormAutoArrangeModal, component: FreeFormAutoArrangeModal }, { condition: $canvasDropdownOpen, component: CanvasDropDownModal }, { condition: $searchModal, component: SearchModals }, { condition: $componentToolsBoxModal, component: ComponentsToolbox }, { condition: $environmentModal, component: EnvironmentModal }, { condition: $tokenModal, component: TokenModal }, { condition: $storageModal, component: StorageModal }, { condition: $templateLibraryModal, component: TemplateLibaryModal }, { condition: $propertyModal, component: PropertyModal }, { condition: $consoleModal, component: ConsoleModal }] as { condition, component }}
		{#if condition}
			{@const SvelteComponent = component}
			<SvelteComponent />
		{/if}
	{/each}
	<!-- Canvas 1 dropdown -->
	<div class="flex items-center gap-x-5">
		<button
			onclick={() => toggleModal(canvasDropdownOpen)}
			class="flex items-center px-4 py-2 pr-6 border-r-2 cursor-pointer gap-x-3 border-r-brand-primary-gray"
		>
			<h1 class="text-md">Canvas 1</h1>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</button>

		<!-- Undo Redo -->
		<div class="flex items-center gap-x-2">
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="undo logo" src={undo_logo} class="w-[1.15rem]" />
			</div>
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="redo logo" src={redo_logo} class="w-[1.15rem]" />
			</div>
		</div>
	</div>

	<!-- Central Tools  -->
	<div class="relative flex items-center gap-x-3 left-10">
		{#each icons.filter((icon) => icon.visibleOnToolbar) as { id, icon, alt, modalComponent }, index}
			<a
				href=" "
				class={`relative p-2 cursor-pointer hover:bg-website-tertiary ${$canvasToolsModal && 'bg-website-tertiary'} rounded-xl`}
				draggable={$canvasToolsModal ? 'true' : 'false'}
				ondragstart={$canvasToolsModal ? () => handleDragStart(index) : null}
				ondrop={$canvasToolsModal ? () => handleDrop(index) : null}
				ondragover={$canvasToolsModal ? (e) => e.preventDefault() : null}
				onclick={() => {
					!$canvasToolsModal ? toggleModal(modalComponent) : null;
				}}
			>
				<img {alt} src={icon} class="w-[1.15rem]" />
				{#if $canvasToolsModal}
					<button
						class="absolute inset-y-0 right-0 top-7"
						onclick={() => toggleIconVisibility(id)}
					>
						<img src={red_remove} alt="minus" class="w-4" />
					</button>
				{/if}
			</a>
		{/each}
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="4"
				stroke="white"
				class="size-3"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</div>
	</div>

	<!-- Zoom in Zoom out Fit screen -->
	<div class="flex items-center gap-x-4">
		<div class="flex items-center gap-x-2">
			<button onclick={zoomIn} class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="zoom_in" src={zoom_in} class="w-5" />
			</button>
			<button onclick={zoomOut} class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="zoom_out" src={zoom_out} class="w-5" />
			</button>
			<button onclick={fitView} class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img alt="fit_screen" src={fit_screen} class="w-5" />
			</button>
		</div>

		<!-- Grid  -->
		<div class="px-5 border-x-2 border-x-brand-primary-gray">
			<div class="p-1.5 cursor-pointer bg-website-tertiary rounded-xl">
				<img src={grid_icon} alt="grid_icon" class="w-5" />
			</div>
		</div>

		<!-- Draw Search -->
		<button
			class="flex items-center mx-2 ml-3 cursor-pointer"
			onclick={() => toggleModal(freeFormAutoArrangeModal)}
		>
			<img src={draw_icon} alt="draw_icon" class="w-5" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="3"
				stroke="white"
				class="size-3"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</button>

		<!-- Search Icon -->
		<button
			onclick={() => toggleModal(searchModal)}
			class="px-3.5 border-l-2 border-l-brand-primary-gray"
		>
			<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
				<img src={search_icon} alt="search_icon" class="w-5" />
			</div>
		</button>
	</div>
</div>
