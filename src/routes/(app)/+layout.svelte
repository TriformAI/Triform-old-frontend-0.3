<script lang="ts">
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { sessionStore } from '$lib/stores/session.svelte'

	const { children } = $props()

	onMount(() => {
		if (!browser) return

		const { user } = sessionStore

		// User identification
		;(window as any).usetifulTags = {
			userId: user?.id || 'ANONYMOUS_USER',
			firstName: user?.name?.split(' ')[0] || '',
			lastName: user?.name?.split(' ').slice(1).join(' ')
		}

		// Add Usetiful script to head
		const head = document.getElementsByTagName('head')[0]
		const script = document.createElement('script')
		script.async = true
		script.src = 'https://www.usetiful.com/dist/usetiful.js'
		script.setAttribute('id', 'usetifulScript')
		script.dataset.token = 'aa6567e1d14d02fd729b87b032f2dda8'
		head.appendChild(script)
	})
</script>

<div>{@render children()}</div>
