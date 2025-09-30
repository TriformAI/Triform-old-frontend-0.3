<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import { onMount, type Snippet } from 'svelte'
	import { toast, Toaster } from 'svelte-sonner'
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import type { Organization } from '$lib/types/auth'
	import { authClient } from '$lib/auth-client'
	import { sessionStore } from '$lib/stores/session.svelte'
	let { children }: { children: Snippet } = $props()

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
		// @ts-expect-error globally defined
		Featurebase('identify', {
			organization: 'triform',
			email: sessionStore.user?.email,
			name: sessionStore.user?.name,
			userId: sessionStore.user?.id,
			profilePicture: sessionStore.user?.image
		})
	})
</script>

<div class="relative transform">{@render children()}</div>

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
