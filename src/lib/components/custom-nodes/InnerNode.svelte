<script lang="ts">
	import { twMerge } from 'tailwind-merge'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { getNodeExecutionState } from '$lib/stores/execution.svelte'

	const {
		type,
		name,
		selected = false,
		class: classes,
		id,
		openFn
	}: {
		type: NodeType
		name: string
		selected?: boolean
		class?: string
		id?: string
		openFn?: () => void
	} = $props()

	const typeData = $derived(nodeTypesDict[type])

	const executionState = $derived(getNodeExecutionState(id ?? ''))
</script>

<svelte:element
	this={openFn ? 'button' : 'div'}
	{id}
	style={`--node-color: ${typeData.color}`}
	class={twMerge([
		'relative flex h-20 w-60 items-center justify-center border p-2 transition-all',
		'hover:bg-main-500/5 backdrop-blur-sm',
		executionState?.state === 'failed'
			? 'border-danger-400/80 bg-danger-900/5'
			: 'border-main-600 bg-main-900/20',
		executionState?.state === 'running' && 'animate-border',
		typeData.shape === 'circle' && 'rounded-full',
		typeData.shape === 'square' && 'rounded-md',
		classes
	])}
	style:background-color={selected
		? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 40%, black) 50%, transparent)'
		: undefined}
	style:border-color={selected
		? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 70%, black) 50%, transparent)'
		: undefined}
	ondblclickcapture={openFn}
>
	<span class="flex flex-row items-center justify-center gap-3">
		<typeData.icon
			class="size-5 drop-shadow-[0px_0px_10px_var(--node-color)]"
			style={`color: ${typeData.iconColor}`}
		/>
		<span class="truncate">{name || 'Untitled'}</span>
	</span>
</svelte:element>
