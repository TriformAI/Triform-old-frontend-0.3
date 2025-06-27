<script lang="ts">
	import Project from '$lib/components/panels/Project.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import Action from '$lib/components/panels/Action.svelte'
	import Flow from '$lib/components/panels/Flow.svelte'
	import { getCurrentFlow } from '$lib/stores/canvas.svelte'
	import { twMerge } from 'tailwind-merge'

	let { class: classes }: { class?: string } = $props()

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
		action: Action
	}

	const NodeComponent = $derived(nodeComponents[nodeType as keyof typeof nodeComponents])
</script>

{#key componentData?.meta?.id}
	<div
		class={twMerge(
			'custom-scrollbar scroll-gutter-stable bg-main-950/60 border-main-800 @container row-span-3 me-2 mb-2 overflow-y-auto rounded-lg border pb-4',
			classes
		)}
	>
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
{/key}
