<script lang="ts">
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { children } = $props()
</script>

<SvelteFlowProvider>
	<div class="flex h-screen flex-col">
		<Navbar />

		<Toolbar />

		<div class="flex-grow">
			{@render children()}
		</div>

		<Footer />
	</div>
</SvelteFlowProvider>
