<script lang="ts">
	import { onMount } from 'svelte'
	import Node from './Node.svelte'

	import { preloadCode, preloadData } from '$app/navigation'
	import { page } from '$app/state'
	const props = $props()

	// Whenever this node is hovered, preload the route for it
	onMount(() => {
		const node = document.querySelector(`div.svelte-flow__node[data-id="${props.id}"]`)
		if (!node) return
		node.addEventListener('mouseenter', async () => {
			const currUrl = page.url.pathname.split('/')
			currUrl.push(props.id)
			const newUrl = currUrl.join('/')
			await Promise.all([preloadData(newUrl), preloadCode(newUrl)])
		})
	})
</script>

<Node {...props} type="agent" />
