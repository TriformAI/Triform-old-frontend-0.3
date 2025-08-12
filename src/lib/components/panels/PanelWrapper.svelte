<script lang="ts">
	import { isAction, isFlow, isAgent } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import Flow from './Flow.svelte'
	import Action from './Action.svelte'
	import Agent from './Agent.svelte'
	import { selected } from '$lib/stores/panel.svelte'

	const nodeId = $derived.by(() => {
		if (
			!selected.node ||
			selected.node.id.endsWith(':input') ||
			selected.node.id.endsWith(':output')
		)
			return 'container'
		return selected.node.id
	})

	const NodeComponent = $derived.by(() => {
		const componentData = getVisibleComponent(nodeId)
		if (!componentData) return
		if (isFlow(componentData)) return Flow
		if (isAction(componentData)) return Action
		if (isAgent(componentData)) return Agent
	})
</script>

{#if NodeComponent}
	{#key nodeId}
		<NodeComponent {nodeId} />
	{/key}
{/if}
