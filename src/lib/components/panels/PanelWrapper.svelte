<script lang="ts">
	import { isAction, isFlow } from '$lib/schemas'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import Flow from './Flow.svelte'
	import Action from './Action.svelte'
	import { selected } from '$lib/stores/panel.svelte'

	const componentData = $derived(selected.node?.data?.trinode?.spec ?? getCurrentContainer())

	const NodeComponent = $derived.by(() => {
		if (!componentData) return
		if (isFlow(componentData)) return Flow
		if (isAction(componentData)) return Action
	})
</script>

{#if NodeComponent && componentData}
	<NodeComponent {componentData} />
{/if}
