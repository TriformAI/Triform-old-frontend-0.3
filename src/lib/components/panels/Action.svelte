<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
	const { nodeId }: { nodeId: string } = $props()
</script>

<Panel {nodeId} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['codeEditor', 'execute', 'metadata', 'variables']} {nodeId} />
	{/snippet}
</Panel>
