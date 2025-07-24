<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import { onMount, type Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import type { Organization } from '$lib/types/auth'
	import { authClient } from '$lib/auth-client'
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

	$inspect(showToaster)

	// put the currently active org into session storage so we can access it from the API constructor
	const updateActiveOrg = () => {
		const activeOrg = page.data.organizations?.find((org: Organization) => org.active)
		console.log('setting active org', activeOrg, page.data.organizations)
		sessionStorage.setItem('activeOrgToken', activeOrg?.token ?? '')
	}
	onMount(updateActiveOrg)
	$effect(() => {
		const ref = page.data.organizations
		updateActiveOrg()
	})
	const session = authClient.useSession()
</script>

<div class="relative transform">{@render children?.()}</div>

{#if showToaster}
	<Toaster richColors position="top-left" />
{/if}
