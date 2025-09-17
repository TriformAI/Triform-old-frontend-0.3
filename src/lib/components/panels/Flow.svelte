<script lang="ts">
	import { isProject } from '$lib/schemas'
	import { getCurrentContainer, getProject } from '$lib/stores/canvas.svelte'
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'

	const { nodeId }: { nodeId: string } = $props()

	const currentIsProject = $derived(isProject(getCurrentContainer()))

	const isTopLevelNode = $derived(nodeId in (getProject()?.spec.nodes ?? {}))

	const items = $derived.by(() => {
		const items = ['execute', 'io', 'metadata', 'variables']

		if (currentIsProject || isTopLevelNode) items.push('triggers')

		return items
	})
</script>

<Panel {nodeId} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems {items} {nodeId} />
	{/snippet}
</Panel>
