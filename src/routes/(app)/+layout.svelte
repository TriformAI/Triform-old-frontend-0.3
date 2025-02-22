<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	const { children } = $props()
</script>

<div class="bg-main-900 grid h-full min-h-screen grid-rows-[auto_1fr]">
	<Navbar />

	<main>
		{@render children()}
	</main>
</div>
