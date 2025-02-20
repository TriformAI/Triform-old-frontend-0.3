<script lang="ts">
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'

	let { children } = $props()
</script>

<SvelteFlowProvider>
	<div class="flex h-screen flex-col">
		<Navbar />

		<div class="flex-grow">
			{@render children()}
		</div>
	</div>
</SvelteFlowProvider>
