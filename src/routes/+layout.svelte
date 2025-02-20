<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import type { Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'
	import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/svelte'

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
</script>

<TolgeeProvider {tolgee}>
	{@render children?.()}
</TolgeeProvider>

<Toaster richColors position="top-right" />
