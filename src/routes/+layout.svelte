<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import type { Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'
	import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/svelte'
	import { page } from '$app/state'
	console.log({ page })

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

<div class={`bg-website-dark-primary`}>
	<TolgeeProvider {tolgee}>
		<main>
			{@render children?.()}
		</main>
	</TolgeeProvider>
</div>

<Toaster richColors position="top-right" />
