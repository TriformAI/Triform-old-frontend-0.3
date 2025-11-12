<script lang="ts">
	import AddIcon from '~icons/material-symbols/add-rounded'
	import Node from './Node.svelte'
	import { getProject, saveContainer } from '$lib/stores/canvas.svelte'
	import Dropdown from '$lib/components/atoms/Dropdown.svelte'
	import DropdownItem from '$lib/components/atoms/DropdownItem.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { getDefaultPayload } from '$lib/utils/getDefaultPayload'

	const project = getProject()

	const scheduledInvocations = $derived(project?.spec.triggers.scheduled.nodes ?? [])
	const availableNodes = $derived(Object.entries(project?.spec.nodes ?? {}))

	const addScheduledInvocation = async (nodeId: string) => {
		if (!project) return toast.error('No project found')
		const snapshot = clone($state.snapshot(project))
		const node = project?.spec.nodes[nodeId]
		if (!node) return toast.error('Node not found')
		project.spec.triggers.scheduled.nodes.push({
			nodeId,
			schedule: '0 0 * * *',
			payload: JSON.parse(getDefaultPayload(node.spec.spec.inputs))
		})
		const res = await saveContainer(snapshot, project)
		if (!res.success) return toast.error('Failed to add scheduled invocation')
	}

	const removeScheduledInvocation = async (index: number) => {
		if (!project) return toast.error('No project found')
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'This will remove the scheduled invocation',
			danger: true
		})
		if (!confirmed) return
		const snapshot = clone($state.snapshot(project))
		project.spec.triggers.scheduled.nodes.splice(index, 1)
		const res = await saveContainer(snapshot, project)
		if (!res.success) return toast.error('Failed to remove scheduled invocation')
	}
</script>

<div class="flex w-full flex-col gap-y-2">
	{#each scheduledInvocations as invocation, idx (idx)}
		<Node {invocation} onRemove={() => removeScheduledInvocation(idx)} />
	{/each}
	<Dropdown contentClass="w-full max-w-96">
		{#snippet trigger()}
			<button
				class={[
					'bg-main-950/60 border-main-800 text-main-400 flex w-full flex-row items-center justify-center gap-2 rounded-md border border-dashed p-4',
					'hover:enabled:bg-main-950/80 hover:enabled:border-main-700 hover:enabled:text-main-300 transition active:enabled:scale-[97%]'
				]}
			>
				<AddIcon class="size-5" />
				Add scheduled invocation
			</button>
		{/snippet}
		{#snippet children()}
			{#each availableNodes as [nodeId, node]}
				{@const nodeType = nodeTypesDict[node.spec.resource.split('/')[0] as NodeType]}
				<DropdownItem
					class="flex flex-row items-center gap-2"
					onSelect={() => addScheduledInvocation(nodeId)}
				>
					{#if nodeType}
						<div style={`color: ${nodeType.iconColor}`}>
							<nodeType.icon class="size-4" />
						</div>
					{/if}
					<p>{node.spec.meta.name}</p>
				</DropdownItem>
			{/each}
		{/snippet}
	</Dropdown>
</div>
