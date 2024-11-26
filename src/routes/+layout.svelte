<script context="module">
	import { browser } from '$app/environment'; // Import to check if the code is running on the client
</script>

<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { toasts, ToastContainer, FlatToast, BootstrapToast } from 'svelte-toasts';
	import Pusher from 'pusher-js';
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
		let authToken = cookies['authToken'];
		if (authToken) {
			return authToken;
		} else if ($page.data.GithubAuthToken) {
			authToken = $page.data.GithubAuthToken;
			if (authToken && browser) {
				document.cookie = `authToken=${authToken}; Path=/; Max-Age=86400; SameSite=Strict`;
				return authToken;
			}
		}
	}

	// Function to check if the user is authenticated either by authToken or GitHub session
	function isAuthenticated() {
		let authToken = checkAuthToken();
		if (authToken) return true;
		else return false;
	}

	onMount(() => {
		if (browser) {
			const session = $page.data.session;
			if (!isAuthenticated(session) && $page.url.pathname === '/dashboard') {
				window.location.href = '/login';
			}
		}
	});

	onMount(() => {
		// Pusher.logToConsole = true;

		let pusher = new Pusher('8845603c589a39579e79', {
			cluster: 'ap2'
		});

		let channel = pusher.subscribe('my-channel');
		channel.bind('my-event', function (data) {
			console.log('Pusher Event:', data);
			toasts.add({
				title: 'Pusher Event',
				description: JSON.stringify(data),
				duration: 5000,
				placement: 'top-right',
				type: 'success',
				theme: 'dark'
			});
		});
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

			<ToastContainer placement="top-right" let:data>
				<FlatToast {data} />
			</ToastContainer>

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
