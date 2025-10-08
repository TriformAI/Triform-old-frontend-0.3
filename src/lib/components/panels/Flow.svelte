<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'

	const { nodeId }: { nodeId: string } = $props()
</script>

<Panel {nodeId} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['execute', 'io', 'metadata', 'variables']} {nodeId} />
	{/snippet}
</Panel>
