<script>
	import { fade, scale } from 'svelte/transition';
	import edit from '$lib/icons/edit.svg';
	import delete_icon from '$lib/icons/delete.svg';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Emit events for edit and delete actions
	function handleEdit() {
		dispatch('edit');
	}

	function handleDelete() {
		dispatch('delete');
	}
</script>

<div
	class="absolute z-50 border shadow-lg right-4 mt-44 bg-website-primary text-brand-white border-brand-primary-gray rounded-2xl"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<a
		href=" "
		class="flex items-center px-8 py-3 text-md gap-x-4 hover:bg-website-tertiary rounded-t-2xl"
		on:click|preventDefault={handleEdit}
	>
		<img src={edit} alt="edit" class="inline-block w-5" />
		<p>Edit</p>
	</a>
	<a
		href=" "
		class="flex items-center px-8 py-3 text-md gap-x-4 hover:bg-website-tertiary rounded-b-2xl"
		on:click|preventDefault={handleDelete}
	>
		<img src={delete_icon} alt="delete_icon" class="inline-block w-5" />
		<p class="text-primary-red">Delete</p>
	</a>
</div>
