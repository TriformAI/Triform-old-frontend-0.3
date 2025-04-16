<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	const { children } = $props()
</script>

<div class="bg-main-900 grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class="overflow-hidden">
		{@render children()}
	</main>
</div>
