<script lang="ts">
	import Project from '$lib/components/panels/Project.svelte'
	import { selected } from '$lib/stores/canvas.svelte'
	import Action from '$lib/components/panels/Action.svelte'
	import Flow from '$lib/components/panels/Flow.svelte'
	import Endpoint from '$lib/components/panels/Endpoint.svelte'

	const nodeType = $derived.by(() => {
		const type = selected.node?.type
		if (!type) return
		if (type === 'open-flow-node') return 'flow'
		return type.split('-')[0]
	})

	const nodeComponents = {
		action: Action,
		flow: Flow,
		endpoint: Endpoint
	}

	const NodeComponent = $derived(nodeComponents[nodeType as keyof typeof nodeComponents])
</script>

<div class="bg-main-950/60 overflow-y-auto py-4">
	{#if selected.isMultiple}
		<p>Multiple nodes selected</p>
	{:else if NodeComponent}
		<NodeComponent />
	{:else}
		<Project />
	{/if}
</div>
