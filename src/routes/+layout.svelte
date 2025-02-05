<script>
	import '../app.css'
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts'
	import Pusher from 'pusher-js'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/svelte'

	import Navbar from '$lib/components/Navbar.svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import { onMount } from 'svelte'
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

	onMount(() => {
		// Pusher.logToConsole = true;

		let pusher = new Pusher('8845603c589a39579e79', {
			cluster: 'ap2'
		})

		let channel = pusher.subscribe('my-channel')
		channel.bind('my-event', function (data) {
			console.log('Pusher Event:', data)
			toasts.add({
				title: 'Pusher Event',
				description: JSON.stringify(data),
				duration: 5000,
				placement: 'top-right',
				type: 'success',
				theme: 'dark'
			})
		})
	})
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props()
</script>

<section class={`bg-website-dark-primary`}>
	<TolgeeProvider {tolgee}>
		{#if page.url.pathname === '/dashboard'}
			<section class="layout bg-website-dark-primary">
				<SvelteFlowProvider>
					<div class="flex flex-col h-screen">
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
