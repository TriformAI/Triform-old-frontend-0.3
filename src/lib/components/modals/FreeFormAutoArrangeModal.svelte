<script>
	import { fade, scale } from 'svelte/transition';

	import grid_icon from '$lib/icons/grid_4x4.svg';
	import draw_icon from '$lib/icons/draw.svg';
</script>

<div
	class="absolute z-50 mt-2 border rounded-lg shadow-lg top-28 right-20 w-60 bg-website-primary text-brand-white border-brand-primary-gray"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<a
		href=" "
		class="flex items-center py-3 rounded-t-lg px-7 text-md gap-x-4 hover:bg-website-tertiary"
	>
		<img src={grid_icon} alt="grid_icon" class="inline-block w-5" />
		<p>Freeform</p>
	</a>
	<a
		href=" "
		class="flex items-center py-3 rounded-b-lg px-7 text-md gap-x-4 hover:bg-website-tertiary"
	>
		<img src={draw_icon} alt="draw_icon" class="inline-block w-5" />
		<p>Auto-Arrange</p>
	</a>
</div>
