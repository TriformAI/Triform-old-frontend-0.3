<script lang="ts">
	import AddIcon from '~icons/material-symbols/add-rounded'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { getFlowModel, getActionModel, getAgentModel } from '$lib/nodeModels'
	import { createComponent } from '$lib/actions/components'
	import { addNode } from '$lib/stores/canvas.svelte'

	import { nodeTypes, type NodeType } from '$lib/constants/nodeTypes'
	import { toast } from 'svelte-sonner'

	interface Props {
		positionAbsoluteX: number
		positionAbsoluteY: number
		data: { activeNodeTypes: NodeType[] }
	}

	const { positionAbsoluteX, positionAbsoluteY, data }: Props = $props()

	let isSelectMode = $state(false)
	let isCreating = $state(false)

	function cancelSelectMode() {
		isSelectMode = false
	}

	const create = async (type: NodeType) => {
		isCreating = true

		const model = {
			flow: getFlowModel({}),
			action: getActionModel({
				sample_input: {
					description: 'Example input/output, replace me',
					type: {
						type: 'string'
					}
				}
			}),
			agent: getAgentModel({})
		}[type]

		try {
			const newFlow = (await createComponent(model)).data

			await addNode(
				newFlow,
				{
					x: positionAbsoluteX,
					y: positionAbsoluteY
				},
				{}
			)
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
		'border-main-500 relative grid h-20 overflow-hidden rounded-md border border-dashed transition-all ease-(--easing-circ) *:col-start-1 *:row-start-1',
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
			'group hover:bg-main-500/5 relative z-10 grid w-20 place-items-center transition',
			isSelectMode ? 'pointer-events-none opacity-0' : 'opacity-100'
		]}
	>
		<AddIcon
			class="text-main-500 group-hover:text-main-400 mt-1 size-6 transition group-hover:scale-110"
		/>
	</button>

	<div class={['flex p-1 leading-none', isSelectMode ? 'opacity-100' : 'opacity-0']}>
		{#each filteredNodeTypes as nodeType}
			<button
				onclick={() => create(nodeType.type)}
				type="button"
				class="group hover:bg-main-500/10 grid w-20 place-items-center rounded-sm transition"
			>
				<nodeType.icon
					style={`color: ${nodeType.iconColor}`}
					class="text-main-300 group-hover:text-main-400 size-5 -translate-y-3 transition group-hover:scale-110"
				/>

				<span
					class="text-main-400 group-hover:text-main-200 absolute translate-y-4 text-xs font-semibold transition"
					>{nodeType.label}</span
				>
			</button>
		{/each}
	</div>
</div>
