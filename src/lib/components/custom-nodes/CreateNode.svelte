<script lang="ts">
	import AddIcon from '~icons/material-symbols/add-rounded'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { getFlowModel, getActionModel, getAgentModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'
	import { addNode, getNodes } from '$lib/stores/canvas.svelte'
	import { nodeTypes, type NodeType } from '$lib/constants/nodeTypes'
	import { toast } from 'svelte-sonner'
	import NodeTypeButton from './NodeTypeButton.svelte'
	import ComponentNameForm from './ComponentNameForm.svelte'
	import { useSvelteFlow } from '@xyflow/svelte'
	import { expandNode } from '$lib/stores/nodeActions.svelte'

	interface Props {
		positionAbsoluteX: number
		positionAbsoluteY: number
		data: { activeNodeTypes: NodeType[] }
	}

	const { positionAbsoluteX, positionAbsoluteY, data }: Props = $props()

	const { fitView } = useSvelteFlow()

	let isSelectMode = $state(false)
	let isCreating = $state(false)

	function cancelSelectMode() {
		isSelectMode = false
		pendingComponentType = undefined
	}

	let pendingComponentType = $state<NodeType>()
	let newComponentName = $state('')

	const initCreate = (type: NodeType) => {
		pendingComponentType = type
	}

	const create = async () => {
		if (!pendingComponentType) {
			return
		}

		isCreating = true

		const model = {
			flow: getFlowModel({}, newComponentName),
			action: getActionModel(
				{
					sample_input: {
						description: 'Example input/output, replace me',
						schema: {
							type: 'string'
						}
					}
				},
				newComponentName
			),
			agent: getAgentModel({}, newComponentName)
		}[pendingComponentType]

		try {
			const newFlow = (await createComponent(model)).data

			const { id } = await addNode(
				newFlow,
				{
					x: positionAbsoluteX,
					y: positionAbsoluteY
				},
				{}
			)

			if (!['flow', 'agent'].includes(pendingComponentType)) return

			const newNode = getNodes().find(n => n.id === id)
			if (!newNode) return
			await fitView({
				nodes: [newNode],
				minZoom: 1,
				maxZoom: 1,
				duration: 500
			})

			if (newNode) await expandNode.onClick(newNode)
		} catch (e) {
			console.log(e)

			toast.error('Failed to create flow')
		} finally {
			isSelectMode = false
			isCreating = false
		}
	}

	const filteredNodeTypes = $derived(nodeTypes.filter(n => data.activeNodeTypes.includes(n.type)))
</script>

<div
	class={[
		'border-main-500 relative grid overflow-hidden rounded-md border border-dashed transition-all ease-(--easing-circ) *:col-start-1 *:row-start-1',
		isSelectMode ? 'w-max' : 'w-20'
	]}
	use:clickOutside={{
		handler: cancelSelectMode
	}}
>
	<button
		onclick={() => (isSelectMode = true)}
		type="button"
		class={[
			'group hover:bg-main-500/5 relative z-10 grid size-20 place-items-center transition',
			isSelectMode ? 'pointer-events-none opacity-0' : 'opacity-100'
		]}
	>
		<AddIcon
			class="text-main-500 group-hover:text-main-400 mt-1 size-6 transition group-hover:scale-110"
		/>
	</button>

	{#if pendingComponentType}
		<ComponentNameForm
			componentTypeName={pendingComponentType}
			onsubmit={create}
			bind:value={newComponentName}
			isLoading={isCreating}
		/>
	{/if}

	<div
		class={[
			'flex p-1 leading-none',
			isSelectMode && !pendingComponentType ? 'opacity-100' : 'opacity-0',
			pendingComponentType && 'pointer-events-none opacity-0'
		]}
	>
		{#each filteredNodeTypes as nodeType}
			<NodeTypeButton {nodeType} onclick={() => initCreate(nodeType.type)} />
		{/each}
	</div>
</div>
