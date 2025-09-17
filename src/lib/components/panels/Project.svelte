<script lang="ts">
	import Panel from './Panel.svelte'
	import { nodeTypesDict } from '$lib/constants/nodeTypes'

	// For projects, we always use 'container' as the nodeId
	const nodeId = 'container'
</script>

<Panel {nodeId} Icon={nodeTypesDict.project.icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['metadata', 'projectSettings', 'variables']} {nodeId} />
	{/snippet}
</Panel>
