<script lang="ts">
	import { clickOutside } from '$lib/utils/clickOutside'
	import { addEdge, addNode } from '$lib/stores/canvas.svelte'

	import { Handle, Position, useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'

	import { nodeTypesDict } from '$lib/constants/nodeTypes'
	import IconClose from '~icons/mdi/close'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { UUID as Uuid } from 'crypto'
	import { getFlowModel, getActionModel, getAgentModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'
	import type { Component, ResolvedComponent, ResolvedFlow } from '$lib/types/resources'
	import { blur, slide } from 'svelte/transition'
	import InputField from '../atoms/InputField.svelte'
	import { toast } from 'svelte-sonner'
	import type { MetaNodeData, NodeData } from '$lib/types/canvas'
	import type * as z from 'zod'
	import { ioModel } from '$lib/schemas'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import { pick } from '$lib/utils/pick'

	const {
		id,
		data
	}: {
		id: Uuid
		data: MetaNodeData
	} = $props()

	const useSvelteFlow = useSvelteFlowHook()
	const { getNode, deleteElements } = useSvelteFlow

	let pendingComponent = $state<Omit<ResolvedComponent, 'id'>>()

	let inputEl: HTMLInputElement | null = $state(null)
	const onInputCreate = (el: HTMLFormElement) => {
		setTimeout(() => {
			const input = el?.querySelector('input')
			if (!input) return
			inputEl = input
			focusInput()
		}, 100)
	}
	const focusInput = () => {
		if (!inputEl) return
		inputEl.focus()
		inputEl.select()
	}

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
			type: { type: 'string' }
		}
		let inputName = handleId
		let newInput: ResolvedFlow['spec']['nodes'][string]['inputs'] | undefined

		const nodeData = sourceNode.data as NodeData
		// if the node selector is attached to the top (target) handle of a node,
		// then we should copy that nodes input schema
		if (data.sourceHandle?.type === 'target') {
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
						type: {
							type: 'string'
						}
					}
				}

	const componentTypes = $derived.by(() => {
		return [
			{
				...nodeTypesDict.flow,
				handler: async () => {
					pendingComponent = getFlowModel(getInput())
					pendingComponent!.meta.name = 'Flow'
					setTimeout(focusInput, 50)
				}
			},
			{
				...nodeTypesDict.action,
				handler: async () => {
					pendingComponent = getActionModel(getInput())
					pendingComponent.meta.name = 'Action'
					setTimeout(focusInput, 50)
				}
			},
			{
				...nodeTypesDict.agent,
				handler: async () => {
					pendingComponent = getAgentModel(getInput())
					pendingComponent.meta.name = 'Agent'
					setTimeout(focusInput, 50)
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
			const newNode = await addNode(newComponent, getNode(id)!.position, nodeInput)
			// if the source handle is a target handle, then the old node need to be updated
			// with an input to the new node as the new one gets placed "above"
			console.log(data.sourceHandle?.type, data.sourceNode, data.sourceHandle)
			if (data.sourceHandle?.type === 'target' && data.sourceNode && data.sourceHandle.id) {
				await addEdge(
					{
						id: newNode.id,
						handle: data.sourceHandle.id
					},
					{
						id: data.sourceNode.id,
						handle: data.sourceHandle.id
					}
				)
			}
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
</script>

<svelte:window
	on:keydown={event => {
		if (event.key === 'Escape') {
			removeSelectorNode()
		}
	}}
/>

<div
	class={['border-main-800 bg-main-850 shadow-window min-w-64 rounded border p-3']}
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
		<h2 class="text-main-400 text-xs font-medium">
			Create {pendingComponent?.resource?.split('/')[0] ?? 'component'}
		</h2>
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
				variation={pendingComponent?.resource.startsWith(type.type) ? 'vibrant' : 'primary'}
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
	{#if pendingComponent}
		<form
			transition:slide={{ duration: 300 }}
			use:onInputCreate
			class="mt-4"
			onsubmit={finaliseComponent}
		>
			<InputField
				label="Name"
				placeholder="Enter a name for the component"
				required
				bind:value={pendingComponent.meta.name}
			/>
			<Button
				variation="primary"
				class="mt-3 w-full px-2 py-1 text-sm"
				type="submit"
				isLoading={addingComponent}
				disabled={addingComponent}
			>
				{#snippet body()}
					Create
				{/snippet}
			</Button>
		</form>
	{/if}

	<Handle
		{id}
		type="source"
		position={Position.Bottom}
		isConnectable={true}
		class={['z-10 !size-2 !bg-[#000]/80']}
	/>
</div>
