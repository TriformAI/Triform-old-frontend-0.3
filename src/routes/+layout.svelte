<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import type { Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'

	let { children }: { children: Snippet } = $props()
</script>

{@render children?.()}

<Toaster richColors position="top-right" />
