<script>
	import '../app.css'
	import Navbar from '$lib/components/Navbar.svelte'
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts'
	import Pusher from 'pusher-js'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Toolbar from '$lib/components/Toolbar.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

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
	{#if $page.url.pathname === '/dashboard'}
		<SvelteFlowProvider>
			<div class="w-full">
				<Navbar />
				<Toolbar />
			</div>

			<ToastContainer placement="top-right" let:data>
				<FlatToast {data} />
			</ToastContainer>

			<div role="main">
				{@render children?.()}
			</div>

			<footer class=" group">
				<Footer />
			</footer>
		</SvelteFlowProvider>
	{:else}
		<main>
			{@render children?.()}
		</main>
	{/if}
</section>
