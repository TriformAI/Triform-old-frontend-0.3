<script lang="ts">
	import Panel from './Panel.svelte'

	// For projects, we always use 'container' as the nodeId
	const nodeId = 'container'
</script>

<Panel {nodeId}>
	{#snippet panelItems(PanelItems)}
		<PanelItems showNav={false} items={['projectSettings']} {nodeId} />
	{/snippet}
</Panel>
