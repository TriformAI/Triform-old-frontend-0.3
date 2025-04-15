<script lang="ts">
	import { nodes, updateNode } from '$lib/stores/canvas.svelte'
	import { addAction, addFlow } from '$lib/stores/nodeActions.svelte'
	import { type Node } from '$lib/types/flow'

	import { clickOutside } from '$lib/utils/clickOutside'
	import {
		Handle,
		Position,
		useEdges,
		useSvelteFlow as useSvelteFlowHook,
		type NodeProps
	} from '@xyflow/svelte'

	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconClose from '~icons/mdi/close'
	import IconAction from '~icons/mdi/rhombus'

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

		if (Object.keys(nodes).length > 2) {
			components.push({
				label: 'Action',
				value: 'action',
				icon: IconAction,
				handler: addAction.onClick
			})
		}

		return components
	})

	// If we should add the new node as a child of the original node or not
	// This is basically only true if the node on the other side of the selector edge
	// is an open flow and we want to add the node as a child as part of that node
	const addAsChild = $derived(!!props.data.addAsChild)

	// Find the node that the selector is connected to
	const [sourceNode, isSource] = $derived.by(() => {
		// Find the edge that connects to this selector node
		const edge = get(edges).find(e => e.target === props.id || e.source === props.id)
		if (!edge) return [] // maybe throw?

		// Get the side of the connection that isn't this selector node
		const node = getNode(props.id === edge.source ? edge.target : edge.source) as Node
		if (!node) return [] // again, maybe throw?

		// If the selector is on the source side of the edge, we should add
		// the new node upstream (ie above) the original node
		const isSource = props.id === edge.source
		return [node, isSource]
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

	async function removeSelectorNode() {
		const node = getNode(props.id)
		if (!node) return

		// We cn use deleteElements here because this is a temporary node
		const result = await deleteElements({ nodes: [node] })
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
		<h2 class="whitespace-nowrap">Create component</h2>
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
						updateNode(sourceNode.id, {
							...sourceNode.data.trinode,
							inputs: [...(sourceNode.data.trinode.inputs ?? []), newNodeId]
						})
					// Publish the parent flow
					const parentId = addAsChild ? sourceNode.id : sourceNode.parentId
					// await publishComponent(parentId ?? 'root')
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
