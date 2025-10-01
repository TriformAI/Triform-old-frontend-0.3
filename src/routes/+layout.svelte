<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import { onMount, type Snippet } from 'svelte'
	import { toast, Toaster } from 'svelte-sonner'
	import { browser } from '$app/environment'
	import { sessionStore } from '$lib/stores/session.svelte'
	import InviteGate from '$lib/components/InviteGate.svelte'
	import { page } from '$app/state'

	let { children }: { children: Snippet } = $props()

	const { user } = $derived(sessionStore)
	$inspect(user)

	const hideGate = $derived(page.url.pathname.startsWith('/login'))

	const loaded = $derived(!!user || hideGate)

	const showToaster = $derived.by(() => {
		// TODO fix logic
		return true
		// if (!browser || !document) return true
		// // don't show any toasts here if there's an open dialog
		// const dialogs = document.querySelectorAll('dialog[open]')
		// console.log('dialogs', dialogs, !dialogs?.length)
		// return !!dialogs?.length
	})

	onMount(() => {
		// @ts-expect-error globally defined
		if (!browser || !Featurebase) return
		console.log('user', user)
		if (!user?.id || !user?.email || !user?.name || !user?.image) return
		// @ts-expect-error globally defined
		Featurebase('identify', {
			organization: 'triform',
			email: user?.email,
			name: user?.name,
			userId: user?.id,
			profilePicture: user?.image
		})
	})
</script>

{#if loaded}
	{#if user?.active || hideGate}
		<div class="relative transform">{@render children()}</div>
	{:else}
		<InviteGate />
	{/if}
	<!-- {:else}
	<div class="bg-main-700 h-full w-full animate-pulse px-8 py-10"></div> -->
{/if}

{#if showToaster}
	<Toaster
		richColors
		position="top-left"
		onclick={() => {
			// TODO: dismiss only this toast, not all
			toast.dismiss()
		}}
	/>
{/if}
