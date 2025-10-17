<script lang="ts">
	import { twMerge } from 'tailwind-merge'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { getNodeExecutionState } from '$lib/stores/execution.svelte'
	import type { CanvasNode } from '$lib/types/canvas'

	const {
		type,
		name,
		selected = false,
		class: classes,
		id,
		openFn,
		node: _node,
		empty
	}: {
		type: NodeType
		name: string
		selected?: boolean
		class?: string
		id?: string
		openFn?: () => void
		node?: CanvasNode
		empty?: boolean
	} = $props()

	const typeData = $derived(nodeTypesDict[type])

	const executionState = $derived(getNodeExecutionState(id ?? ''))

	const backgroundColor = $derived(
		selected
			? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 40%, black) 50%, transparent)'
			: undefined
	)
	const borderColor = $derived(
		selected
			? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 70%, black) 50%, transparent)'
			: undefined
	)
</script>

<svelte:element
	this={openFn ? 'button' : 'div'}
	{id}
	style={`--node-color: ${typeData.color}`}
	class={twMerge([
		'relative flex h-20 w-full min-w-60 items-center justify-center border p-2 transition-all',
		'hover:bg-main-500/5 backdrop-blur-sm',
		'peer',
		executionState?.state === 'failed'
			? 'border-danger-400/80 bg-danger-900/5'
			: 'border-main-600 bg-main-900/20',
		executionState?.state === 'running' && 'animate-border',
		typeData.shape === 'circle' && 'rounded-full',
		typeData.shape === 'square' && 'rounded-md',
		classes
	])}
	style:background-color={backgroundColor}
	style:border-color={borderColor}
	ondblclick={type === 'action' ? undefined : openFn}
	role="button"
	tabindex="0"
>
	{#if !empty}
		<span class="flex flex-row items-center justify-center gap-3">
			<typeData.icon
				class="size-5 drop-shadow-[0px_0px_10px_var(--node-color)]"
				style={`color: ${typeData.iconColor}`}
			/>
			<span class="truncate">{name ?? 'Untitled'}</span>
		</span>
	{/if}
</svelte:element>
{#if type !== 'action'}
	<button
		class={[
			'pointer-events-none opacity-0 transition delay-150',
			'peer-hover:pointer-events-auto peer-hover:opacity-100 hover:pointer-events-auto hover:opacity-100',
			'absolute -bottom-4 -left-4 flex items-center justify-center',
			'text-main-400 text-sm',
			'hover:text-main-300',
			'active:scale-95',
			'border-main-600 rounded-md border px-2.5 py-1.5 backdrop-blur-xs'
		]}
		style={`--node-color: ${typeData.color}`}
		style:background-color={backgroundColor}
		style:border-color={borderColor}
		onclick={openFn}
	>
		Open
	</button>
{/if}
