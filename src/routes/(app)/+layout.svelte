<script lang="ts">
	import { page } from '$app/state'
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	const { children } = $props()

	const hideOverflow = $derived(page.url.pathname.startsWith('/project') && page.params.id) // On a project page
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class={[hideOverflow && 'overflow-hidden']}>
		{@render children()}
	</main>
</div>
