<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
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
		consoleModal
	} from '$lib/stores/modals';

	// Check if the authToken cookie exists
	function checkAuthToken() {
		const cookieString = document.cookie;
		const cookies = cookieString.split('; ').reduce((acc, cookie) => {
			const [name, value] = cookie.split('=');
			acc[name] = value;
			return acc;
		}, {});
		return cookies['authToken'];
	}

	// Redirect if authToken is not found
	onMount(() => {
		const authToken = checkAuthToken();
		if (!authToken && ['/dashboard'].some((path) => $page.url.pathname.startsWith(path))) {
			window.location.href = '/login';
		}
	});

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	// General toggle function for all dropdowns
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
	let isProtectedRoute = ['/dashboard'].some((path) => $page.url.pathname.startsWith(path));
</script>

<section class={`bg-website-dark-primary`}>
	<SvelteFlowProvider>
		{#if isProtectedRoute}
			<div class="w-full">
				<Navbar />
				<Toolbar />
			</div>

			<main onclick={generalToggle}>
				{@render children?.()}
			</main>

			<footer class=" group">
				<Footer />
			</footer>
		{:else}
			<main onclick={generalToggle}>
				{@render children?.()}
			</main>
		{/if}
	</SvelteFlowProvider>
</section>
