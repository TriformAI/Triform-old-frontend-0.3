<script lang="ts">
	import Project from '$lib/components/panels/Project.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import Action from '$lib/components/panels/Action.svelte'
	import Flow from '$lib/components/panels/Flow.svelte'
	import Endpoint from '$lib/components/panels/Endpoint.svelte'
	import { getCurrentFlow } from '$lib/stores/canvas.svelte'

	const componentData = $derived.by(() => {
		if (selected.node && selected.node.data && selected.node.data.trinode) {
			return selected.node.data.trinode.spec
		} else if (getCurrentFlow()) {
			return getCurrentFlow()!.spec
		}

		return undefined
	})

	const nodeType = $derived.by(() => {
		const type = selected.node?.type
		if (!type) return
		return type.split('-')[0]
	})

	const nodeComponents = {
		flow: Flow,
		action: Action,
		endpoint: Endpoint
	}

	const NodeComponent = $derived(nodeComponents[nodeType as keyof typeof nodeComponents])
</script>

<div class="bg-main-950/60 row-span-2 overflow-y-auto py-4">
	{#if selected.isMultiple}
		<p class="mx-3">Multiple nodes selected</p>
	{:else if NodeComponent}
		<NodeComponent componentData={componentData!} />
	{:else if getCurrentFlow()}
		<Flow componentData={componentData!} />
	{:else}
		<Project />
	{/if}
</div>
