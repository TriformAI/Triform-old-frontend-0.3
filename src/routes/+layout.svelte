<script>
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'

	import '../app.css'
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/svelte'

	import Navbar from '$lib/components/Navbar.svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import { page } from '$app/state'

	const tolgee = new Tolgee()
		.use(DevTools())
		.use(FormatSimple())
		.init({
			language: 'en',
			apiUrl: import.meta.env.VITE_TOLGEE_API_URL,
			apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
			// For prod:
			staticData: {}
		})

	let { children } = $props()
</script>

<section class={`bg-website-dark-primary`}>
	<TolgeeProvider {tolgee}>
		{#if page.url.pathname === '/dashboard'}
			<section class="layout bg-website-dark-primary">
				<SvelteFlowProvider>
					<div class="flex h-screen flex-col">
						<Navbar />
						<Toolbar />
						<div class="flex-grow">
							{@render children?.()}
						</div>
						<Footer />
					</div>
					<ToastContainer placement="top-right" let:data>
						<FlatToast {data} />
					</ToastContainer>
				</SvelteFlowProvider>
			</section>
		{:else}
			<main>
				{@render children?.()}
			</main>
		{/if}
	</TolgeeProvider>
</section>
