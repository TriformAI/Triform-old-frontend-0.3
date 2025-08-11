<script lang="ts">
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import type { MetaNodeType } from '$lib/types/canvas'
	import NodeContainer from './NodeContainer.svelte'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconAgent from '~icons/material-symbols/psychology-rounded'
	import { isAgent, isFlow } from '$lib/schemas'
	import IconOutput from '~icons/material-symbols/output-circle-rounded'

	const {
		type
	}: {
		type: MetaNodeType
	} = $props()

	const container = $derived(getCurrentContainer())
	const visualData = $derived.by(() => {
		if (isFlow(container))
			return {
				icon: IconFlow,
				color: 'var(--color-complement-500)'
			}
		if (isAgent(container))
			return {
				icon: IconAgent,
				color: 'var(--color-accent-500)'
			}
	})
	const ioType = $derived(type.split('-')[0]) as 'input' | 'output'
	const sourceHandles = $derived(
		'inputs' in container.spec && ioType === 'input' ? Object.keys(container.spec.inputs) : []
	)
	const targetHandles = $derived(
		'outputs' in container.spec && ioType === 'output' ? Object.keys(container.spec.outputs) : []
	)
</script>

{#if visualData}
	<NodeContainer {targetHandles} {sourceHandles}>
		{#snippet body()}
			<div
				id={`${container.id}:${ioType}`}
				style={`--node-color: ${visualData.color}`}
				class={[
					'relative flex h-15 w-md items-center justify-center border-[color-mix(in_oklab,var(--node-color)70%,transparent)] p-2 transition-all',
					'to-complement-400/10 from-complement-800/0 border-main-200',
					ioType === 'input' ? 'bg-to border-b' : 'border-t'
				]}
			>
				<span class="flex flex-row items-center justify-center gap-3">
					<IconOutput
						class="size-5 drop-shadow-[0px_0px_10px_var(--node-color)]"
						style={`color: ${visualData.color}`}
					/>
					<span class="text-main-300 truncate capitalize">{ioType}</span>
				</span>
			</div>
		{/snippet}
	</NodeContainer>
{/if}
