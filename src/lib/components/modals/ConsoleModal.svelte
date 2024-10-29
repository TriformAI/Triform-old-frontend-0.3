<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import search_icon from '$lib/icons/search.svg';
	import filter from '$lib/icons/filter.svg';
	import unpined from '$lib/icons/unpined.svg';
	import pined from '$lib/icons/pined.svg';
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
	import dots from '$lib/icons/dots.svg';
	import DeleteEditModal from './DeleteEditModal.svelte';

	let pined_unpined = $state(false);

	function togglePined() {
		pined_unpined = !pined_unpined;
	}
</script>

<button
	class="absolute z-50 w-[90%] right-20 border rounded-lg shadow-lg bottom-28 bg-website-secondary text-brand-tertiary-gray border-brand-primary-gray"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex flex-col px-4 py-6 border-b gap-y-5 border-brand-primary-gray">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Logs and Console</h3>
			</div>
			<div class="flex items-center gap-x-10">
				<img src={search_icon} alt="search" class="w-6" />
				<img src={filter} alt="filter" class="w-6" />
				<div class="pl-8 border-l border-l-brand-primary-gray">
					{#if pined_unpined}
						<a
							href=" "
							aria-label="pinned"
							class="w-6 cursor-pointer"
							role="button"
							tabindex="0"
							onclick={togglePined}
						>
							<img src={pined} alt="pined" class="w-6" />
						</a>
					{:else}
						<a
							href=" "
							class="w-6 cursor-pointer"
							onclick={togglePined}
							aria-label="Unpin"
							role="button"
							tabindex="0"
						>
							<img src={unpined} alt="unpined" class="w-6" />
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Collapsible Category List -->
	<div class="px-4 py-6 space-y-4 text-xl text-left truncate bg-website-primary">
		<h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!</h3>
		<h3 class="text-primary-red">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!
		</h3>
		<h3 class="text-primary-yellow">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, officia!
		</h3>
	</div>
</button>
