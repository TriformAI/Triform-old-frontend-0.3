<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';

	export let title = 'Confirmation';
	export let body = '';
	export let footer = [];
	export let onModalClose;

	onDestroy(() => {
		document.body.style.overflow = 'auto'; // Enable scrolling
	});
</script>

<!-- Background Overlay -->
<div
	class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"
	on:click={onModalClose}
></div>

<div class="flex items-center justify-center">
	<div
		class="w-[50rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:scale={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal title icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">{title}</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" on:click={onModalClose}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="p-6 text-white">{body}</div>

		<!-- Modal Footer -->
		<div class="flex justify-end gap-4 p-3 border-t border-brand-primary-gray">
			{#each footer as button (button.text)}
				<Button content={{ text: button.text }} on:click={button.onClick} type={button.type} />
			{/each}
		</div>
	</div>
</div>
