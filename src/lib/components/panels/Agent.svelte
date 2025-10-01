<script lang="ts">
	import Panel from './Panel.svelte'
	import { nodeTypesDict } from '$lib/constants/nodeTypes'
	const { nodeId }: { nodeId: string } = $props()
	import { isProject } from '$lib/schemas'
	import { getCurrentContainer, getCurrentNodePath, getProject } from '$lib/stores/canvas.svelte'

	const currentIsProject = $derived(isProject(getCurrentContainer()))

	const realNodeId = $derived(nodeId === 'container' ? getCurrentNodePath().at(-1) : nodeId)
	const isTopLevelNode = $derived(realNodeId && realNodeId in (getProject()?.spec.nodes ?? {}))
</script>

<Panel {nodeId} Icon={nodeTypesDict.agent.icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems
			items={[
				'agentSettings',
				'io',
				'metadata',
				'execute',
				'variables',
				(currentIsProject || isTopLevelNode) && 'triggers'
			].filter(Boolean)}
			{nodeId}
		/>
	{/snippet}
</Panel>
