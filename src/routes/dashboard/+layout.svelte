<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'

	const { children } = $props()
</script>

<div class="flex h-screen flex-col bg-zinc-900">
	<Navbar />

	<div class="container mx-auto mt-5 flex-grow px-6">
		{@render children()}
	</div>
</div>
