<script lang="ts">
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import type { MetaNodeType } from '$lib/types/canvas'
	import NodeContainer from './NodeContainer.svelte'
	import { isAgent, isFlow } from '$lib/schemas'
	import IconInput from '~icons/material-symbols/input-circle-rounded'
	import IconOutput from '~icons/material-symbols/output-circle-rounded'
	import { nodeTypes, nodeTypesDict } from '$lib/constants/nodeTypes'

	const {
		type,
		id
	}: {
		type: MetaNodeType
		id: string
	} = $props()

	const container = $derived(getCurrentContainer())

	const visualData = $derived.by(() => {
		if (isFlow(container)) return nodeTypesDict.flow
		if (isAgent(container)) return nodeTypesDict.agent
	})

	const ioType = $derived(type.split('-')[0]) as 'input' | 'output'

	const sourceHandles = $derived(
		'inputs' in container.spec && ioType === 'input' ? Object.keys(container.spec.inputs) : []
	)

	const targetHandles = $derived(
		'outputs' in container.spec && ioType === 'output' ? Object.keys(container.spec.outputs) : []
	)

	const Icon = $derived(ioType === 'input' ? IconInput : IconOutput)
</script>

{#if visualData}
	<NodeContainer {targetHandles} {sourceHandles} {id}>
		{#snippet body()}
			<div
				id={`${container.id}:${ioType}`}
				style={`--node-color: ${visualData.color}`}
				class={[
					'relative flex h-15 w-md items-center justify-center p-2 transition-all',
					'to-complement-400/10 from-complement-800/0 border-main-500',
					ioType === 'input' ? 'bg-to border-b' : 'border-t'
				]}
			>
				<span class="flex flex-row items-center justify-center gap-3">
					<Icon
						class={[
							'size-5 drop-shadow-[0px_0px_10px_var(--node-color)]',
							ioType === 'input' && 'rotate-180'
						]}
						style={`color: ${visualData.color}`}
					/>
					<span class="text-main-300 truncate capitalize">{ioType}</span>
				</span>
			</div>
		{/snippet}
	</NodeContainer>
{/if}
