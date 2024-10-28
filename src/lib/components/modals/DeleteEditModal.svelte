<script>
	import { fade, scale } from 'svelte/transition';
	import edit from '$lib/icons/edit.svg';
	import delete_icon from '$lib/icons/delete.svg';
</script>

<div
	class="absolute right-4 mt-44  bg-website-primary text-brand-white border border-brand-primary-gray rounded-2xl shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<a
		href=" "
		class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary rounded-t-2xl"
	>
		<img src={edit} alt="edit" class="inline-block w-6" />
		<p>Edit</p>
	</a>
	<a href=" " class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary rounded-b-2xl">
		<img src={delete_icon} alt="delte_icon" class="inline-block w-6" />
		<p class="text-primary-red">Delete</p>
	</a>
</div>
