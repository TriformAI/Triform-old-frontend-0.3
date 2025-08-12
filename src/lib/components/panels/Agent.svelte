<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/psychology-rounded'
	const { nodeId }: { nodeId: string } = $props()
</script>

<Panel {nodeId} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['agentSettings', 'io', 'metadata']} {nodeId} />
	{/snippet}
</Panel>
