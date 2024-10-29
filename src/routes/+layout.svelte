<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte'; // Assuming your Sidebar component is here
	import { page } from '$app/stores';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import {
		profileDropdown,
		notificationOpen,
		canvasDropdownOpen,
		freeFormAutoArrangeModal,
		searchModal,
		componentToolsBoxModal,
		environmentModal,
		tokenModal,
		storageModal,
		templateLibraryModal,
		propertyModal,
		consoleModal,
	} from '$lib/stores/modals';
	
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	//general toggle function for all dropdowns
	function generalToggle() {
		profileDropdown.update((value) => false);
		notificationOpen.update((value) => false);
		canvasDropdownOpen.update((value) => false);
		freeFormAutoArrangeModal.update((value) => false);
		searchModal.update((value) => false);
		componentToolsBoxModal.update((value) => false);
		environmentModal.update((value) => false);
		tokenModal.update((value) => false);
		storageModal.update((value) => false);
		templateLibraryModal.update((value) => false);
		propertyModal.update((value) => false);
		consoleModal.update((value) => false);
	}

	// Reactive statement to check if the route is protected
	let isProtectedRoute = $derived(['/dashboard'].some((path) => $page.url.pathname.startsWith(path)));
</script>

<section class={`bg-website-dark-primary`}>
	{#if isProtectedRoute}
		<div class="w-full">
			<Navbar />
			<Toolbar />
		</div>
	{/if}

	<main onclick={generalToggle}>
		{@render children?.()}
	</main>

	{#if isProtectedRoute}
		<footer class=" group">
			<Footer />
		</footer>
	{/if}
</section>

