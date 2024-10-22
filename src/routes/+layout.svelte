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
		searchModal
	} from '$lib/stores/modals';

	//general toggle function for all dropdowns
	function generalToggle() {
		profileDropdown.update((value) => false);
		notificationOpen.update((value) => false);
		canvasDropdownOpen.update((value) => false);
		freeFormAutoArrangeModal.update((value) => false);
		searchModal.update((value) => false);
	}

	// Reactive statement to check if the route is protected
	$: isProtectedRoute = ['/dashboard'].some((path) => $page.url.pathname.startsWith(path));
</script>

<main class="bg-[#091136] app">
	{#if isProtectedRoute}
		<div class="w-full">
			<Navbar />
			<Toolbar />
		</div>
	{/if}

	<main on:click={generalToggle}>
		<slot />
	</main>

	{#if isProtectedRoute}
		<footer class=" group">
			<Footer />
		</footer>
	{/if}
</main>

<style>
	.app {
		font-family: 'Figtree', sans-serif;
	}
</style>
