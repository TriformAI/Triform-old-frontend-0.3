<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import FlowNode from '$lib/components/custom-nodes/FlowNode.svelte'
	import LoadingNode from '$lib/components/custom-nodes/LoadingNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'
	import CreateNode from '$lib/components/custom-nodes/CreateNode.svelte'
	import Edge from './Edge.svelte'
	import {
		handleBeforeDelete,
		handleDelete,
		handleConnectEnd,
		handleDragStop
	} from '$lib/components/canvas/FlowEvents'
	import { addNode, getEdges, getNodes, setEdges, setNodes } from '$lib/stores/canvas.svelte'
	import { defaultEdgeProps, type MetaNodeType, type NodeType } from '$lib/types/canvas'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		useSvelteFlow as svelteFlowHook,
		useUpdateNodeInternals,
		type EdgeTypes
	} from '@xyflow/svelte'
	import '@xyflow/svelte/dist/style.css'
	import { type Component, onMount, tick } from 'svelte'
	import { debounce } from '../../utils/debounce'
	import { isValidConnection } from './FlowEvents/isValidConnection'
	import { scale } from 'svelte/transition'
	import { getComponent } from '$lib/actions/components'
	import { isFlow } from '$lib/types/resources'
	import { type UUID as Uuid } from 'crypto'
	import { flowHasComponent } from '$lib/utils/flowHasComponent'
	import { toast } from 'svelte-sonner'
	import { getProject, refreshFlow } from '$lib/stores/canvas.svelte'
	import IoNode from '../custom-nodes/IONode.svelte'
	import AgentNode from '../custom-nodes/AgentNode.svelte'
	const useSvelteFlow = svelteFlowHook()
	const { fitView, screenToFlowPosition } = useSvelteFlow
	export { fitView }
	const updateNodeInternals = useUpdateNodeInternals()

	const nodeTypes: Record<NodeType | MetaNodeType, Component> = {
		'action-node': ActionNode,
		'flow-node': FlowNode,
		'agent-node': AgentNode,
		'selector-node': SelectorNode,
		'loading-node': LoadingNode,
		'create-node': CreateNode,
		'input-node': IoNode,
		'output-node': IoNode
	}

	const edgeTypes: EdgeTypes = {
		// @ts-expect-error TODO: adjust props on component
		default: Edge
	}

	const {
		isGoingDeeper
	}: {
		isGoingDeeper: boolean
	} = $props()

	const transitionSize = 0.25
	const transitionDuration = 350

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy'
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault()
		if (!event.dataTransfer) return
		const project = getProject()
		if (!project) return toast.error('No project found')

		const componentId = event.dataTransfer.getData('text/plain')
		const component = await getComponent(componentId as Uuid)

		// make sure we're not creating a recursive flow in any way
		if (component.data.resource === 'flow/v1') {
			for (const node of Object.values(project.spec.nodes)) {
				if (!isFlow(node.spec)) continue
				if (flowHasComponent(node.spec, component.data))
					return toast.error(`You can't add a component as a child of itself`)
			}
		}

		const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

		await addNode(component.data, position, {})
	}

	onMount(async () => {
		refreshFlow()
		await tick()
		fitView({
			maxZoom: 1,
			minZoom: 1
		})

		await new Promise(resolve => setTimeout(resolve, 50))
		// FIXME: super braindead hack to make sure everything lines up as it should
		const interval = setInterval(() => updateNodeInternals(getNodes().map(n => n.id)), 35)
		setTimeout(() => clearInterval(interval), transitionDuration + 50)
	})
</script>

<svelte:window
	onresize={debounce(() => {
		fitView({
			maxZoom: 1,
			duration: 500
		})
	}, 400)}
/>

<div
	class="absolute inset-0 grid h-full w-full overflow-hidden"
	role="application"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	in:scale={{
		start: isGoingDeeper ? 1 - transitionSize : 1 + transitionSize,
		opacity: 0,
		duration: transitionDuration
	}}
	out:scale={{
		start: isGoingDeeper ? 1 + transitionSize : 1 - transitionSize,
		opacity: 0,
		duration: transitionDuration
	}}
>
	<SvelteFlow
		bind:nodes={getNodes, setNodes}
		bind:edges={getEdges, setEdges}
		{nodeTypes}
		{edgeTypes}
		defaultEdgeOptions={{ data: { props: defaultEdgeProps } }}
		isValidConnection={(...args) => isValidConnection(...args, useSvelteFlow)}
		fitView
		fitViewOptions={{
			maxZoom: 1,
			minZoom: 1
		}}
		disableKeyboardA11y={true}
		onconnectend={(...args) => handleConnectEnd(...args, useSvelteFlow)}
		snapGrid={[20, 20]}
		proOptions={{ hideAttribution: true }}
		zoomOnDoubleClick={false}
		onbeforedelete={handleBeforeDelete}
		ondelete={handleDelete}
		onnodedragstop={handleDragStop}
		onbeforeconnect={e => {
			// Prevent edge from sticking when connecting to ghost ports
			if (e.sourceHandle === 'ghost-source' || e.targetHandle === 'ghost-target') {
				return false
			}
		}}
	>
		<Background
			bgColor="#18181b"
			patternColor="#52525c"
			gap={20}
			size={1.25}
			variant={BackgroundVariant.Dots}
		/>
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow__container[role='application']) {
		background: var(--color-main-900) !important;
	}
</style>
