<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte'
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconAction from '~icons/mdi/rhombus'
	import { useSvelteFlow as useSvelteFlowHook, useEdges } from '@xyflow/svelte'
	import { nodes, publishComponent, updateNode } from '$lib/stores/canvas.svelte'
	import IconClose from '~icons/mdi/close'
	import { addAction, addFlow } from '$lib/stores/nodeActions.svelte'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { type Node, type NodeData } from '$lib/types/flow'
	import { get } from 'svelte/store'
	import { onMount } from 'svelte'

	const props: NodeProps = $props()

	const edges = useEdges()
	const useSvelteFlow = useSvelteFlowHook()
	const { getNode, deleteElements, updateNode: updateFlowNode } = useSvelteFlow

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

	const [sourceNode, addAsChild, isSource] = $derived.by(() => {
		const edge = get(edges).find(e => e.id.endsWith(':nodeSelector'))
		if (!edge) return []
		// Get the side of the connection that isn't this selector node
		const node = getNode(props.id === edge.source ? edge.target : edge.source) as Node
		if (!node) return []
		const addUpstream = props.id === edge.source
		return [node, !!edge.data?.addAsChild, addUpstream]
	})

	onMount(() => {
		// If the selector is a source node, we need to move it up by its full height to make the port line up
		if (!isSource) return
		const node = getNode(props.id)
		if (!node) return
		setTimeout(() => {
			console.log(node.position.y)
			console.log(node.measured, node.height, node.sourcePosition, node.targetPosition)
			node.position.y -= node.measured?.height ?? 0
			console.log('moved selector up', node.position.y)
			updateFlowNode(props.id, node)
		}, 10)
	})

	function removeSelectorNode() {
		const node = getNode(props.id)
		if (!node) return
		deleteElements({ nodes: [node] })

		if (!sourceNode?.parentId) return
		const flow = getNode(sourceNode.parentId)
		if (!flow) return
		const extended = (flow.data as NodeData).extended?.height ?? 0
		flow.height = (flow.measured?.height ?? 0) - extended
		flow.data.extended = { height: 0 }
		updateFlowNode(flow.id, flow)
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
	class={['border-main-800 bg-main-850 shadow-window rounded border p-4']}
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
		class={['z-10 !size-2 !bg-[#000]/80', isSource ? 'invisible' : ''].join(' ')}
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
				onclick={async () => {
					if (!sourceNode) return
					console.log('sourcenode', sourceNode)
					const newNodeId = await type.handler(
						sourceNode as Node,
						useSvelteFlow,
						addAsChild,
						// If the selector is the source, the new node will get added upstream from this node so, we need to set the input on the old node instead
						isSource ? [] : undefined
					)
					if (!newNodeId) return
					// Add the correct input to the old node if needed
					if (isSource)
						await updateNode(
							sourceNode.id,
							{
								inputs: [...(sourceNode.data.inputs ?? []), newNodeId]
							},
							false
						)
					// Publish the parent flow
					const parentId = addAsChild ? sourceNode.id : sourceNode.parentId
					await publishComponent(parentId ?? 'root')
				}}
				type="button"
				class="border-main-700/50 hover:bg-main-700/50 bg-main-800 place-items-center justify-center gap-2 rounded border px-4 py-2 font-medium transition-colors duration-200"
			>
				<type.icon class="size-5" />
				<span>{type.label}</span>
			</button>
		{/each}
	</div>

	<Handle
		id={props.id}
		type="source"
		position={Position.Bottom}
		isConnectable={true}
		class={['z-10 !size-2 !bg-[#000]/80', isSource ? '' : 'invisible'].join(' ')}
	/>
</div>
