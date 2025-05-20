<script lang="ts">
	import { onMount } from 'svelte'
	import Node from './Node.svelte'
	import IconNetworkNode from '~icons/material-symbols/network-node'
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

<Node {...props} shape="square" --node-color="var(--color-accent-300)">
	{#snippet icon()}
		<IconNetworkNode class="text-accent-500 mb-1 h-6 w-6" />
	{/snippet}
</Node>
