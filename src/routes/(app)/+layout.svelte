<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	const { children } = $props()
</script>

<div class="bg-main-900 flex h-screen flex-col">
	<Navbar />

	<div class="container mx-auto mt-5 flex-grow px-6">
		{@render children()}
	</div>
</div>
