<script lang="ts">
	import { page } from '$app/state'
	import { isAction, isFlow } from '$lib/schemas'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import Flow from './Flow.svelte'
	import Action from './Action.svelte'

	const componentData = $derived.by(() => {
		return getCurrentContainer()
	})

	const NodeComponent = $derived.by(() => {
		if (!componentData) return
		if (isFlow(componentData)) return Flow
		if (isAction(componentData)) return Action
	})
</script>

{#if NodeComponent && componentData}
	<NodeComponent {componentData} />
{/if}
