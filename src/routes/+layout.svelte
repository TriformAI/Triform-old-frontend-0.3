<script lang="ts">
	import '@fontsource/space-mono'
	import '@fontsource-variable/figtree'
	import '../app.css'
	import { type Snippet } from 'svelte'
	import { Toaster } from 'svelte-sonner'

	let { children }: { children: Snippet } = $props()
</script>

<div class="relative transform">{@render children?.()}</div>

<Toaster richColors position="top-left" />
