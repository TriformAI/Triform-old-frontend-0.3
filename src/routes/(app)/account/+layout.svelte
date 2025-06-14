<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	const { children } = $props()
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class="container">
		{@render children()}
	</main>
</div>
