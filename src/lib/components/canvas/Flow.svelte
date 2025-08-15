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
		useOnSelectionChange,
		type EdgeTypes
	} from '@xyflow/svelte'
	import '@xyflow/svelte/dist/style.css'
	import { type Component, onMount, tick } from 'svelte'
	import { debounce } from '../../utils/debounce'
	import { isValidConnection } from './FlowEvents/isValidConnection'
	import { scale } from 'svelte/transition'
	import { type OnNavigate } from '@sveltejs/kit'
	import { onNavigate } from '$app/navigation'
	import { getComponent } from '$lib/actions/components'
	import { isFlow } from '$lib/types/resources'
	import { type UUID as Uuid } from 'crypto'
	import { getFlowModel } from '$lib/nodeModels'
	import { flowHasComponent } from '$lib/utils/flowHasComponent'
	import { toast } from 'svelte-sonner'
	import { getProject, refreshFlow } from '$lib/stores/canvas.svelte'
	import type { NodeContainer } from '$lib/types/flow'
	import { page } from '$app/state'
	import { isAction, type resolvedProjectModel } from '$lib/schemas'
	import type * as z from 'zod'
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

	let isGoingDeeper = $state(false)

	onNavigate(async (navigation: OnNavigate) => {
		if (!navigation.to || !navigation.from) return
		const {
			to: {
				url: { pathname: toPath }
			},
			from: {
				url: { pathname: fromPath }
			}
		} = navigation
		// if there are more parts in the path we're going deeper 🌊
		isGoingDeeper = toPath.split('/').length > fromPath.split('/').length
		// wait a tick to make sure the transition is applied
		await tick()
		// FIXME: super braindead hack to make sure everything lines up as it should
		const interval = setInterval(() => updateNodeInternals(getNodes().map(n => n.id)), 50)
		setTimeout(() => clearInterval(interval), 450)

		return
	})

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
	class="relative grid h-full w-full overflow-hidden"
	role="application"
	ondragover={handleDragOver}
	ondrop={handleDrop}
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
