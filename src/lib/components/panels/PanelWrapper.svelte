<script lang="ts">
	import { isAction, isFlow } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import Flow from './Flow.svelte'
	import Action from './Action.svelte'
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
	})
</script>

{#if NodeComponent}
	{#key nodeId}
		<NodeComponent {nodeId} />
	{/key}
{/if}
