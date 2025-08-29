<script lang="ts">
	import { clickOutside } from '$lib/utils/clickOutside'
	import { addEdge, addNode } from '$lib/stores/canvas.svelte'
	import { Handle, Position, useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'
	import NodeTypeButton from './NodeTypeButton.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import type { UUID as Uuid } from 'crypto'
	import { getFlowModel, getActionModel, getAgentModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'
	import type { ResolvedComponent, ResolvedFlow } from '$lib/types/resources'
	import { toast } from 'svelte-sonner'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import type * as z from 'zod'
	import { ioModel } from '$lib/schemas'
	import { getCurrentContainer, getNodes } from '$lib/stores/canvas.svelte'
	import ComponentNameForm from './ComponentNameForm.svelte'
	import { expandNode } from '$lib/stores/nodeActions.svelte'

	const {
		id,
		data
	}: {
		id: Uuid
		data: MetaNodeData
	} = $props()

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode, deleteElements, fitView } = useSvelteFlow

	let pendingComponent = $state<Omit<ResolvedComponent, 'id'>>()

	// Get input schema and connection info from the edge/handle data
	const [sourceInput, nodeInput]: [
		z.infer<typeof ioModel>,
		ResolvedFlow['spec']['nodes'][string]['inputs'] | undefined
	] = $derived.by(() => {
		const handleId = data.sourceHandle?.id
		const sourceNode = data.sourceNode
		const container = getCurrentContainer()
		if (!handleId || !sourceNode) return [{}, {}]

		let inputSchema: z.infer<typeof ioModel>['input'] = {
			description: 'Generated input',
			schema: {}
		}
		let inputName = handleId
		let newInput: ResolvedFlow['spec']['nodes'][string]['inputs'] | undefined

		const nodeData = sourceNode.data as NodeData
		if (data.sourceNode?.type === 'input-node') {
			// if the node selector is attached to the input (meta) node, copy from the container
			const container = getCurrentContainer()
			if (!('inputs' in container.spec)) return [{}, {}]
			inputSchema = container.spec.inputs[handleId]
			if (!inputSchema) console.error('No input schema found for container', container.id)
			newInput = {
				[inputName]: {
					source: 'parent',
					target: inputName
				}
			}
			return [{ [inputName]: inputSchema }, newInput]
		} else if (data.sourceNode?.type === 'output-node') {
			// if the node selector is attached to the output (meta) node, copy from the container
			const container = getCurrentContainer()
			if (!('outputs' in container.spec)) return [{}, {}]
			inputSchema = container.spec.outputs[handleId]
			if (!inputSchema) console.error('No output schema found for container', container.id)
		} else if (data.sourceHandle?.type === 'target') {
			// if the node selector is attached to the top (target) handle of a node,
			// then we should copy that nodes input schema
			const inputSchemaFromNode = nodeData.trinode.spec.spec.inputs?.[handleId]
			if (inputSchemaFromNode) inputSchema = inputSchemaFromNode
			else console.error('No input schema found for node', sourceNode.id)
		} else {
			// otherwise, we need to copy it from the source node's output schema
			const outputSchema = nodeData.trinode.spec.spec.outputs?.[handleId]
			if (outputSchema) inputSchema = outputSchema
			else console.error('No output schema found for node', sourceNode.id)
			newInput = {
				[inputName]: {
					source: sourceNode.type === 'input-node' ? 'parent' : sourceNode.id,
					target: inputName
				}
			}
		}

		return [{ [inputName]: inputSchema }, newInput]
	})

	const getInput = () =>
		Object.keys(sourceInput).length
			? sourceInput
			: {
					sample_input: {
						description: 'Example input/output, replace me',
						schema: {}
					}
				}

	const componentTypes = $derived.by(() => {
		return [
			{
				...nodeTypesDict.flow,
				handler: async () => {
					pendingComponent = getFlowModel(getInput())
				}
			},
			{
				...nodeTypesDict.action,
				handler: async () => {
					pendingComponent = getActionModel(getInput())
				}
			},
			{
				...nodeTypesDict.agent,
				handler: async () => {
					pendingComponent = getAgentModel(getInput())
				}
			}
		]
	})

	let addingComponent = $state(false)

	const finaliseComponent = async () => {
		if (!pendingComponent || addingComponent) return
		try {
			addingComponent = true
			pendingComponent.meta.name = pendingComponent.meta.name.trim()
			if (!pendingComponent.meta.name) {
				toast.error('Name is required')
				return
			}
			const newComponent = (await createComponent(pendingComponent)).data
			const { id: nodeId } = await addNode(newComponent, getNode(id)!.position, nodeInput)
			// if the source handle is a target handle, then the old node need to be updated
			// with an input to the new node as the new one gets placed "above"
			console.log(data.sourceHandle?.type, data.sourceNode, data.sourceHandle)
			if (data.sourceHandle?.type === 'target' && data.sourceNode && data.sourceHandle.id) {
				await addEdge(
					{
						id: nodeId,
						handle: data.sourceHandle.id
					},
					{
						id: data.sourceNode.id,
						handle: data.sourceHandle.id
					}
				)
			}

			const newNode = getNodes().find(n => n.id === nodeId)
			if (!newNode) return
			await fitView({
				nodes: [newNode],
				minZoom: 1,
				maxZoom: 1,
				duration: 500
			})
			await expandNode.onClick(newNode)
		} catch (error) {
			console.error(error)
			toast.error('Failed to create component')
		} finally {
			addingComponent = false
		}
	}

	async function removeSelectorNode() {
		const node = getNode(id)
		if (!node) return

		// We can use deleteElements here because this is a temporary node
		const _result = await deleteElements({ nodes: [node] })
	}

	const activeHandleType = $derived(data.sourceHandle?.type === 'source' ? 'target' : 'source')

	const showSourceHandle = $derived(activeHandleType === 'target')
	const showTargetHandle = $derived(activeHandleType === 'source')
</script>

<svelte:window
	on:keydown={event => {
		if (event.key === 'Escape') {
			removeSelectorNode()
		}
	}}
/>

<div
	class={['border-main-800 bg-main-850 shadow-window  rounded-md border']}
	use:clickOutside={{
		eventType: 'mousedown',
		handler: () => {
			removeSelectorNode()
		}
	}}
>
	{#if showSourceHandle}
		<Handle
			{id}
			type="target"
			onpointerdown={(e: PointerEvent) => e.preventDefault()}
			position={Position.Top}
			isConnectable={true}
			class={['z-10 !size-2 !bg-[#000]/80']}
		/>
	{/if}

	<div class="grid p-1 *:col-start-1 *:row-start-1">
		{#if pendingComponent}
			<ComponentNameForm
				componentTypeName={pendingComponent.resource.split('/')[0] as NodeType}
				onsubmit={finaliseComponent}
				bind:value={pendingComponent.meta.name}
				isLoading={addingComponent}
			/>
		{/if}

		<div
			class={[
				'mx-auto flex gap-1 leading-none',
				pendingComponent && 'pointer-events-none opacity-0'
			]}
		>
			{#each componentTypes as nodeType}
				<NodeTypeButton
					{nodeType}
					withBgColor={true}
					onclick={async () => {
						nodeType.handler()
					}}
				/>
			{/each}
		</div>
	</div>

	{#if showTargetHandle}
		<Handle
			{id}
			onpointerdown={(e: PointerEvent) => e.preventDefault()}
			type="source"
			position={Position.Bottom}
			isConnectable={true}
			class={['z-10 !size-2 !bg-[#000]/80']}
		/>
	{/if}
</div>
