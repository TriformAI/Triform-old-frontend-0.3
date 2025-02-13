<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'

	import type { Snippet } from 'svelte'

	import '../app.css'
	import { Toaster } from 'svelte-sonner'
	import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/svelte'

	import { refreshUserData } from '$lib/stores/user.svelte'
	import { onMount } from 'svelte'

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

	let { children }: { children: Snippet } = $props()

	onMount(() => {
		refreshUserData()
	})
</script>

<div class={`bg-website-dark-primary`}>
	<TolgeeProvider {tolgee}>
		<main>
			{@render children?.()}
		</main>
	</TolgeeProvider>
</div>

<Toaster richColors position="top-right" />
