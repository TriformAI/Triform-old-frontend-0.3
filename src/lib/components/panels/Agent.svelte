<script lang="ts">
	import Panel from './Panel.svelte'
	import { nodeTypesDict } from '$lib/constants/nodeTypes'
	const { nodeId }: { nodeId: string } = $props()
	import { isProject } from '$lib/schemas'
	import { getCurrentContainer, getProject } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'

	const currentIsProject = $derived(isProject(getCurrentContainer()))

	const isTopLevelNode = $derived(nodeId in (getProject()?.spec.nodes ?? {}))
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
