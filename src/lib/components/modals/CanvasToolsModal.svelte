<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import green_plus from '$lib/icons/green_add.svg';
	import { canvasToolsModal } from '$lib/stores/modals';
	import { toggleIconVisibility } from '$lib/stores/tools';
	import Button from '$lib/components/Button.svelte';
	import { iconsStore } from '$lib/stores/tools';

	/**
	 * @type {{ id: number; icon: string; alt: string; visibleOnToolbar: boolean; }[]}
	 */
	let moreIcons = $state();
	iconsStore.subscribe((value) => {
		moreIcons = value.filter((icon) => !icon.visibleOnToolbar);
	});
</script>

<div class="fixed inset-0 z-40 bg-black top-40 bg-opacity-20 backdrop-blur-lg"></div>

<div
	class="absolute w-[60rem] top-96 right-96 mx-auto bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between p-6 border-b border-brand-primary-gray">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			<h3 class="text-xl font-semibold text-left text-white">Available tools in the More Menu</h3>
		</div>
		<button
			type="button"
			class="cursor-pointer w-9"
			onclick={() => canvasToolsModal.update((value) => false)}
		>
			<img src={modal_cross} alt="Close modal" class="w-9" />
		</button>
	</div>

	<!-- Modal Body -->
	<div class="flex flex-wrap items-center gap-5 p-10 rounded-b-lg bg-website-primary">
		{#each moreIcons as { id, icon, alt }}
			<button
				class="relative p-2 cursor-pointer bg-website-tertiary rounded-xl"
				onclick={() => toggleIconVisibility(id)}
			>
				<img {alt} src={icon} class="w-8" />
				<div class="absolute inset-y-0 right-0 top-10">
					<img src={green_plus} alt="add" class="w-5" />
				</div>
			</button>
		{/each}
	</div>

	<!-- Modal Footer -->
	<div class="flex justify-end p-6 py-3 border-t border-brand-primary-gray bg-website-primary">
		<Button content={{ text: 'Done' }} on:click={() => canvasToolsModal.update((value) => false)} />
	</div>
</div>
