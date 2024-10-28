<script>
	import { fade, scale } from 'svelte/transition';

	import grid_icon from '$lib/icons/grid_4x4.svg';
	import draw_icon from '$lib/icons/draw.svg';
</script>

<div
	class="absolute top-44 right-20 mt-2 w-72 bg-website-primary text-brand-white border border-brand-primary-gray rounded-lg shadow-lg z-50"
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
