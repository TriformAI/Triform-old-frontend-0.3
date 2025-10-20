<script lang="ts">
	import type { resolvedProjectModel } from '$lib/schemas/projects'
	import type * as z from 'zod'
	import { selectedTools } from '$lib/stores/triggerChat.svelte'

	let {
		toolboxes
	}: {
		toolboxes: z.infer<typeof resolvedProjectModel>[]
	} = $props()

	const onToggle = (projectId: string) => {
		const isSelected = selectedTools.tools.some(tool => tool.projectId === projectId)
		if (isSelected) {
			selectedTools.tools = selectedTools.tools.filter(tool => tool.projectId !== projectId)
		} else {
			const project = toolboxes.find(t => t.id === projectId)
			if (!project || !project.spec.nodes) return
			selectedTools.tools = [
				...selectedTools.tools,
				...Object.keys(project.spec.nodes).map(nodeId => ({ projectId, nodeId }))
			]
		}
	}
</script>

<div class="flex flex-col gap-2 p-2">
	{#each toolboxes as toolbox}
		{@const isSelected = selectedTools.tools.some(tool => tool.projectId === toolbox.id)}
		<div
			class={[
				'border-main-800 flex flex-col gap-2 rounded-md border p-4 transition',
				isSelected ? 'bg-main-900' : 'bg-main-900/60 border-transparent'
			]}
		>
			<div class="flex flex-row justify-between gap-1">
				<h4 class={['font-medium', isSelected ? 'text-main-200' : 'text-main-300/90']}>
					{toolbox.meta.name}
				</h4>
				<input
					type="checkbox"
					class="checkbox mt-1 size-[1.3rem]"
					checked={isSelected}
					onchange={() => onToggle(toolbox.id ?? '')}
				/>
			</div>
			{#each Object.values(toolbox.spec.nodes) as node}
				<span class={['line-clamp-2 text-sm', isSelected ? 'text-main-400' : 'text-main-500']}>
					{node.spec.meta.name}
				</span>
			{/each}
		</div>
	{/each}
</div>
