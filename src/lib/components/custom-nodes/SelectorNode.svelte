<script lang="ts">
	import { clickOutside } from '$lib/utils/clickOutside'
	import { addNode } from '$lib/stores/canvas.svelte'

	import { Handle, Position, useSvelteFlow as useSvelteFlowHook } from '@xyflow/svelte'

	import IconFlow from '~icons/material-symbols/network-node'
	import IconClose from '~icons/mdi/close'
	import IconAction from '~icons/mdi/rhombus'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { UUID as Uuid } from 'crypto'
	import { getFlowModel, getActionModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'
	import type { Component, ResolvedComponent, ResolvedFlow } from '$lib/types/resources'
	import { blur, slide } from 'svelte/transition'
	import InputField from '../atoms/InputField.svelte'
	import { toast } from 'svelte-sonner'
	import type { MetaNodeData } from '$lib/types/canvas'
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

	// copy the input from the source node to the new component that we're about to create
	const [sourceInput, nodeInput]: [
		z.infer<typeof ioModel>,
		ResolvedFlow['spec']['nodes'][string]['inputs']
	] = $derived.by(() => {
		const inputName = data.sourceHandle?.id
		const container = getCurrentContainer()
		if (!inputName || !container || !data.sourceNode?.id) return [{}, {}]
		const sourceIsParent = data.sourceNode.type === 'input-node'
		const node = sourceIsParent
			? (container as ResolvedComponent)
			: container.spec.nodes[data.sourceNode.id].spec
		if (!node) return [{}, {}]
		let input: z.infer<typeof ioModel>['input']
		// if it's an input node, we'll have to yoink the input from the input of the source node
		if (data.sourceNode.type === 'input-node') input = node.spec.inputs[inputName]
		// otherwise, it should come from the output of the source node
		else {
			input = pick(node.spec.outputs[inputName], ['description', 'type'])
		}
		return [
			{ [inputName]: input },
			{ [inputName]: { source: sourceIsParent ? 'parent' : data.sourceNode.id, target: inputName } }
		]
	})

	const componentTypes = $derived.by(() => {
		return [
			{
				label: 'Flow',
				value: 'flow',
				icon: IconFlow,
				handler: async () => {
					pendingComponent = getFlowModel(sourceInput)
					pendingComponent!.meta.name = 'Flow'
					setTimeout(focusInput, 50)
				}
			},
			{
				label: 'Action',
				value: 'action',
				icon: IconAction,
				handler: async () => {
					pendingComponent = getActionModel(sourceInput)
					pendingComponent.meta.name = 'Action'
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
			await addNode(newComponent, getNode(id)!.position, nodeInput)
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
				variation={pendingComponent?.resource.startsWith(type.value) ? 'vibrant' : 'primary'}
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
