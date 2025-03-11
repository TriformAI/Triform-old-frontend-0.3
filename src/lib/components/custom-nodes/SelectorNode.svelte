<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte'
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconAction from '~icons/mdi/rhombus'
	import { useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import { nodes } from '$lib/stores/canvas.svelte'
	import IconClose from '~icons/mdi/close'
	import { addAction, addFlow } from '$lib/stores/nodeActions.svelte'
	import { clickOutside } from '$lib/utils/clickOutside'
	import type { Uuid } from '$lib/types/agent'
	import { type Node } from '$lib/types/flow'

	interface Props extends NodeProps {
		sourceNodeId: Uuid
	}

	const props: Props = $props()

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode, deleteElements } = useSvelteFlow

	const componentTypes = $derived.by(() => {
		const components = [
			{
				label: 'Flow',
				value: 'flow',
				icon: IconFlow,
				handler: addFlow.onClick
			}
		]

		if ($nodes.length > 2) {
			components.push({
				label: 'Action',
				value: 'action',
				icon: IconAction,
				handler: addAction.onClick
			})
		}

		return components
	})

	const sourceNode = $derived.by(() => {
		const node = getNode(props.data.sourceNodeId as Uuid)
		return node
	})

	function removeSelectorNode() {
		const node = getNode(props.id)
		if (!node) return
		deleteElements({ nodes: [node] })

		// Get the dom node..
		// Shrink it back to height before dragging was initialized
		const flowContainer = document.querySelector<HTMLDivElement>(
			`[data-id="${sourceNode?.parentId}"]`
		)

		if (!flowContainer) {
			return
		}

		flowContainer.style.height = (parseInt(flowContainer.style.height) - 80).toString() + 'px'
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
	class="border-main-800 bg-main-850 shadow-window rounded border p-4"
	use:clickOutside={{
		eventType: 'mousedown',
		handler: () => {
			removeSelectorNode()
		}
	}}
>
	<Handle
		id={props.id}
		type="target"
		position={Position.Top}
		isConnectable={true}
		class="z-10 !size-2 !bg-[#000]/80"
	/>

	<div class="eyebrow mb-4 flex justify-between">
		<h2 class="">Create component</h2>
		<button class="ms-6" type="button" onclick={removeSelectorNode}>
			<IconClose class="size-4" />
		</button>
	</div>

	<div class="grid auto-cols-fr grid-flow-col gap-3">
		{#each componentTypes as type}
			<button
				onclick={() => {
					type.handler(sourceNode as Node, useSvelteFlow)
					setTimeout(() => {
						console.log('$nodes', $nodes)
					}, 100)
				}}
				type="button"
				class="border-main-700/50 hover:bg-main-700/50 bg-main-800 place-items-center justify-center gap-2 rounded border px-4 py-2 font-medium transition-colors duration-200"
			>
				<type.icon class="size-5" />
				<span>{type.label}</span>
			</button>
		{/each}
	</div>
</div>
