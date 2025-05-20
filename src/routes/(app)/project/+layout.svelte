<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import BreadCrumbs from '$lib/components/canvas/Breadcrumbs.svelte'
	import 'balloon-css'

	const { children } = $props()
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar>
		<BreadCrumbs />
	</Navbar>

	<main class="overflow-hidden">
		{@render children()}
	</main>
</div>
