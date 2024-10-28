<script>
	import { fade, scale } from 'svelte/transition';
	import { canvasToolsModal, toggleModal, statusModal, renameMode } from '$lib/stores/modals';
	import canvas_dropdown_1 from '$lib/icons/canvas_dropdown_1.svg';
	import canvas_dropdown_2 from '$lib/icons/canvas_dropdown_2.svg';
	import canvas_dropdown_3 from '$lib/icons/canvas_dropdown_3.svg';
	import canvas_dropdown_4 from '$lib/icons/canvas_dropdown_4.svg';
	import canvas_dropdown_5 from '$lib/icons/canvas_dropdown_5.svg';
	import canvas_dropdown_6 from '$lib/icons/canvas_dropdown_6.svg';
	import canvas_dropdown_7 from '$lib/icons/canvas_dropdown_7.svg';
	import canvas_dropdown_8 from '$lib/icons/canvas_dropdown_8.svg';
	import canvas_dropdown_9 from '$lib/icons/canvas_dropdown_9.svg';
	import canvas_dropdown_10 from '$lib/icons/canvas_dropdown_10.svg';
</script>

<div
	class="absolute left-8 top-44 mt-2 w-80 bg-website-primary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
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
	<button
		on:click={() => toggleModal(renameMode)}
		class="flex items-center w-full px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
	>
		<img src={canvas_dropdown_3} alt="canvas_dropdown_3" class="inline-block w-6" />
		<p class="flex-shrink-0">Rename Canvas</p>
	</button>
	<hr class="border-t-brand-primary-gray" />

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
	<hr class="border-t-brand-primary-gray" />

	<button
		on:click={() => {
			toggleModal(canvasToolsModal);
		}}
		class="flex items-center w-full px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
	>
		<img src={canvas_dropdown_10} alt="canvas_dropdown_9" class="inline-block w-6" />
		<p class="flex-shrink-0">Customize Top Bar</p>
	</button>
	<button
		on:click={() => {
			toggleModal(statusModal);
		}}
		class="flex items-center w-full px-10 py-4 text-lg rounded-b-lg gap-x-4 hover:bg-website-tertiary"
	>
		<img src={canvas_dropdown_10} alt="canvas_dropdown_10" class="inline-block w-6" />
		<p class="flex-shrink-0">Customize Status Bar</p>
	</button>
</div>
