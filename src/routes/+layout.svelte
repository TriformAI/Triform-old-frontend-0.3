<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte'; // Assuming your Sidebar component is here
	import { page } from '$app/stores';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Reactive statement to check if the route is protected
	$: isProtectedRoute = ['/dashboard'].some((path) => $page.url.pathname.startsWith(path));
</script>

<main class="bg-[#091136]">
	{#if isProtectedRoute}
		<div class="w-full">
			<Navbar />
			<Toolbar />
		</div>
	{/if}

	<main>
		<slot />
	</main>

	{#if isProtectedRoute}
		<footer >
			<Footer />
		</footer>
	{/if}
</main>

<style>
</style>
