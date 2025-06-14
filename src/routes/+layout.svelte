<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import { type Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'
	import { browser } from '$app/environment'

	let { children }: { children: Snippet } = $props()

	const showToaster = $derived.by(() => {
		if (!browser || !document) return true
		// don't show any toasts here if there's an open dialog
		const dialogs = document.querySelectorAll('dialog[open]')
		console.log('dialogs', dialogs, !dialogs?.length)
		return !!dialogs?.length
	})
</script>

<div class="relative transform">{@render children?.()}</div>

{#if showToaster}
	<Toaster richColors position="top-left" />
{/if}
