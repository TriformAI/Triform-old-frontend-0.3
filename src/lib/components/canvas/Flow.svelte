<script lang="ts">
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import EndpointNode from '$lib/components/custom-nodes/EndpointNode.svelte'
	import FlowNode from '$lib/components/custom-nodes/FlowNode.svelte'
	import LoadingNode from '$lib/components/custom-nodes/LoadingNode.svelte'
	import ParentNode from '$lib/components/custom-nodes/ParentNode.svelte'
	import SelectorNode from '$lib/components/custom-nodes/SelectorNode.svelte'
	import CreateNode from '$lib/components/custom-nodes/CreateNode.svelte'
	import Edge from './Edge.svelte'
	import {
		handleBeforeDelete,
		handleDelete,
		handleConnectEnd,
		handleDragStop
	} from '$lib/components/canvas/FlowEvents'
	import {
		addNode,
		getEdges,
		getNodes,
		setEdges,
		setNodes,
		getCurrentFlow,
		getProject
	} from '$lib/stores/canvas.svelte'
	import { defaultEdgeProps, type NodeType } from '$lib/types/flow'
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
	import { type Component, tick } from 'svelte'
	import { debounce } from '../../utils/debounce'
	import { isValidConnection } from './FlowEvents/isValidConnection'
	import { scale } from 'svelte/transition'
	import { type OnNavigate } from '@sveltejs/kit'
	import { onNavigate } from '$app/navigation'
	import { getComponent, createComponent } from '$lib/actions/components'
	import { isAction, isFlow, type Uuid } from '$lib/types/agent'
	import { getFlowModel } from '$lib/nodeModels'
	import { flowHasComponent } from '$lib/utils/flowHasComponent'
	import { toast } from 'svelte-sonner'

	const useSvelteFlow = svelteFlowHook()
	const { fitView, screenToFlowPosition } = useSvelteFlow
	export { fitView }
	const updateNodeInternals = useUpdateNodeInternals()

	const nodeTypes: Record<NodeType, Component> = {
		'endpoint-node': EndpointNode,
		'action-node': ActionNode,
		'flow-node': FlowNode,
		// @ts-expect-error TODO: adjust props on component
		'selector-node': SelectorNode,
		'loading-node': LoadingNode,
		'parent-node': ParentNode,
		'create-node': CreateNode
	}

	const edgeTypes: EdgeTypes = {
		// @ts-expect-error TODO: adjust props on component
		default: Edge
	}

	const flowIsEmpty = $derived(!getNodes().length)

	let isGoingDeeper = $state(false)

	// Add or remove from url hash when selection changes
	useOnSelectionChange(({ nodes }) => {
		if (nodes.length === 0) {
			history.replaceState(null, '', location.pathname + location.search)
			return
		} else if (nodes.length === 1) {
			window.location.hash = nodes[0].id
		}
	})

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
		if (component.resource === 'flow/v1') {
			for (const node of Object.values(project.spec.nodes)) {
				if (!isFlow(node.spec)) continue
				if (flowHasComponent(node.spec, component))
					return toast.error(`You can't add a component as a child of itself`)
			}
		}

		const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

		await addNode(component, position, [])
	}

	const createInitialFlow = async () => {
		const newComponent = await createComponent(getFlowModel().spec)
		addNode(newComponent, { x: 0, y: 0 }, [])
	}
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
	{#if flowIsEmpty}
		<div class="-mt-32 grid place-items-center gap-10 self-center">
			<p class="opacity-50">
				Get started by adding your first
				{!getCurrentFlow() ? 'flow' : 'action'}
			</p>
			<button
				onclick={createInitialFlow}
				type="button"
				class="bg-main-300 text-main-800 grid size-20 place-content-center rounded-full text-4xl leading-none transition-transform duration-300 ease-(--easing-circ) hover:scale-105"
			>
				+
			</button>
		</div>
	{:else}
		{#key getCurrentFlow()?.component_id}
			{@const transitionSize = 0.25}
			{@const transitionDuration = 400}
			<div
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
				class="absolute inset-0"
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
					<div
						class={[
							getCurrentFlow() ? 'opacity-100' : 'opacity-0',
							'transition-opacity duration-500'
						]}
					>
						<Background
							bgColor="#18181b"
							patternColor="#52525c"
							gap={20}
							size={1}
							variant={BackgroundVariant.Dots}
						/>
					</div>
				</SvelteFlow>
			</div>
		{/key}
	{/if}
</div>

<style>
	:global(.svelte-flow__container[role='application']) {
		background: var(--color-main-900) !important;
	}
</style>
