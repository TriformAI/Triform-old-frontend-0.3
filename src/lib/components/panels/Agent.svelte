<script lang="ts">
	import Panel from './Panel.svelte'
	import { nodeTypesDict } from '$lib/constants/nodeTypes'
	const { nodeId }: { nodeId: string } = $props()
</script>

<Panel {nodeId} Icon={nodeTypesDict.agent.icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['agentSettings', 'io', 'metadata', 'execute', 'variables']} {nodeId} />
	{/snippet}
</Panel>
