<script lang="ts">
	import { getCurrentNodePath, getProject } from '$lib/stores/canvas.svelte'
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'
	const { nodeId }: { nodeId: string } = $props()

	const isTopLevelNode = $derived(
		nodeId in getProject().spec.nodes ||
			(nodeId === 'container' && getCurrentNodePath().length === 1)
	)
</script>

<Panel {nodeId} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems
			items={['execute', 'metadata', 'variables', isTopLevelNode && 'triggers'].filter(Boolean)}
			{nodeId}
		/>
	{/snippet}
</Panel>
