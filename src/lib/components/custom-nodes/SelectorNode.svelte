<script lang="ts">
	import { clickOutside } from '$lib/utils/clickOutside'
	import { addNode } from '$lib/stores/canvas.svelte'

	import { Handle, Position, useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'

	import IconFlow from '~icons/material-symbols/network-node'
	import IconClose from '~icons/mdi/close'
	import IconAction from '~icons/mdi/rhombus'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Uuid } from '$lib/types/agent'
	import { getFlowModel, getActionModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'

	interface Props {
		id: Uuid
		data: {
			sourceIsParent: boolean
			sourceNodeId: Uuid
		}
	}

	const { id, data }: Props = $props()

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode, deleteElements } = useSvelteFlow

	const componentTypes = $derived.by(() => {
		return [
			{
				label: 'Flow',
				value: 'flow',
				icon: IconFlow,
				handler: async () => {
					const newComponent = await createComponent(getFlowModel().spec)
					addNode(newComponent, getNode(id)!.position, [
						data.sourceIsParent ? 'parent' : data.sourceNodeId
					])
				}
			},
			{
				label: 'Action',
				value: 'action',
				icon: IconAction,
				handler: async () => {
					const newComponent = await createComponent(getActionModel().spec)
					addNode(newComponent, getNode(id)!.position, [
						data.sourceIsParent ? 'parent' : data.sourceNodeId
					])
				}
			}
		]
	})

	async function removeSelectorNode() {
		const node = getNode(id)
		if (!node) return

		// We cn use deleteElements here because this is a temporary node
		const _result = await deleteElements({ nodes: [node] })
	}
</script>

<svelte:window
	on:keydown={event => {
		if (event.key === 'Escape') {
			removeSelectorNode()
		}
	}}
/>

<div
	class={['border-main-800 bg-main-850 shadow-window rounded border p-2']}
	use:clickOutside={{
		eventType: 'mousedown',
		handler: () => {
			removeSelectorNode()
		}
	}}
>
	<Handle
		{id}
		type="target"
		position={Position.Top}
		isConnectable={true}
		class={['z-10 !size-2 !bg-[#000]/80']}
	/>

	<div class=" mb-4 flex justify-between">
		<h2 class="text-main-400 text-xs font-medium whitespace-nowrap">Create component</h2>
		<button class="ms-6" type="button" onclick={removeSelectorNode}>
			<IconClose class="size-4" />
		</button>
	</div>

	<div class="grid auto-cols-fr grid-flow-col gap-3">
		{#each componentTypes as type}
			<Button
				class="px-2 py-1 text-sm"
				onClick={async () => {
					type.handler()
				}}
				autoLoad="promise"
			>
				{#snippet icon()}
					<type.icon class="size-4" />
				{/snippet}
				{#snippet body()}
					<span>{type.label}</span>
				{/snippet}
			</Button>
		{/each}
	</div>

	<Handle
		{id}
		type="source"
		position={Position.Bottom}
		isConnectable={true}
		class={['z-10 !size-2 !bg-[#000]/80']}
	/>
</div>
