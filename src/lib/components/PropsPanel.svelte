<script lang="ts">
	import NodeIcon from '$lib/components/custom-nodes/NodeIcon.svelte'
	import { useSvelteFlow } from '@xyflow/svelte'

	import { nodes } from '$lib/stores/canvas.svelte'

	const selectedNode = $derived($nodes.find(n => n.selected))
	const nodeType = $derived(selectedNode?.type?.split('-')[0] ?? 'action')
</script>

<div class="bg-main-900 p-5">
	{#if selectedNode}
		<p class="grid grid-cols-[auto_1fr] items-center gap-2">
			<NodeIcon type={nodeType} class="size-5" />

			{selectedNode.data.component_name}
		</p>
	{/if}
</div>
