<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte'; // Assuming your Sidebar component is here
	import { page } from '$app/stores'; 

	// Reactive statement to check if the route is protected
	$: isProtectedRoute = ['/dashboard', '/modules', '/flows', '/playground', '/environment', '/storage', '/library', '/billings'].some((path) =>
		$page.url.pathname.startsWith(path)
	);
</script>

<div class="app bg-website-secondary">
	{#if isProtectedRoute}
	<div class="pr-10 font-sans" >
		<Sidebar />
	</div>
	{/if}

	<main >
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
	}

	main {
		flex-grow: 1;
	}
</style>
