<script context="module">
	import { browser } from '$app/environment'; // Import to check if the code is running on the client
</script>

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

	// Check if the authToken cookie exists (only in the browser)
	function checkAuthToken() {
		if (!browser) return null; // Ensure this code only runs in the browser
		const cookieString = document.cookie;
		const cookies = cookieString.split('; ').reduce((acc, cookie) => {
			const [name, value] = cookie.split('=');
			acc[name] = value;
			return acc;
		}, {});
		return cookies['authToken'];
	}

	// Function to check if the user is authenticated either by authToken or GitHub session
	function isAuthenticated(session) {
		const authToken = checkAuthToken();
		return authToken || (session && session.user);
	}

	// Redirect if neither authToken nor GitHub session is found
	onMount(() => {
		if (browser) {
			const session = $page.data.session;
			if (
				!isAuthenticated(session) &&
				$page.url.pathname === '/dashboard' // Strict match for /dashboard
			) {
				window.location.href = '/login';
			}
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

	// Reactive statement to check if the route is protected and the user is authenticated
	let isProtectedRoute = $page.url.pathname === '/dashboard'; // Strict match for /dashboard
	let session = $page.data.session;
	let isAuthenticatedUser = isAuthenticated(session);
</script>

<section class={`bg-website-dark-primary`}>
	<SvelteFlowProvider>
		{#if isProtectedRoute && isAuthenticatedUser}
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
