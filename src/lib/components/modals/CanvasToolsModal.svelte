<script lang="ts">
	import { fade, scale } from 'svelte/transition'
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import modal_cross from '$lib/icons/modal_cross.svg'
	import green_plus from '$lib/icons/green_add.svg'
	import { canvasToolsModal } from '$lib/stores/modals'
	import { toggleIconVisibility } from '$lib/stores/tools'
	import Button from '$lib/components/Button.svelte'
	import { iconsStore } from '$lib/stores/tools'

	let moreIcons: { id: number; icon: string; alt: string; visibleOnToolbar: boolean }[] = []
	iconsStore.subscribe(value => {
		moreIcons = value.filter(icon => !icon.visibleOnToolbar)
	})
</script>

<div class="fixed inset-0 z-40 bg-black top-[6.5rem] bg-opacity-20 backdrop-blur-lg"></div>

<div class="relative flex items-center justify-center top-52">
	<div
		class="w-[60rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Available tools in the More Menu</h3>
			</div>
			<button
				type="button"
				class="cursor-pointer w-9"
				onclick={() => canvasToolsModal.update(() => false)}
			>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="flex flex-wrap items-center gap-5 p-6 rounded-b-lg bg-website-primary">
			{#each moreIcons as { id, icon, alt }}
				<button
					class="relative p-2 cursor-pointer bg-website-tertiary rounded-xl"
					onclick={() => toggleIconVisibility(id)}
				>
					<img {alt} src={icon} class="w-5" />
					<div class="absolute inset-y-0 right-0 top-8">
						<img src={green_plus} alt="add" class="w-4" />
					</div>
				</button>
			{/each}
		</div>

		<!-- Modal Footer -->
		<div class="flex justify-end p-3 border-t border-brand-primary-gray bg-website-primary">
			<Button content={{ text: 'Done' }} on:click={() => canvasToolsModal.update(() => false)} />
		</div>
	</div>
</div>
