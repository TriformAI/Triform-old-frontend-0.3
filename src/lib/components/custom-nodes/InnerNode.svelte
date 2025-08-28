<script lang="ts">
	import { twMerge } from 'tailwind-merge'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'

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
</script>

<svelte:element
	this={openFn ? 'button' : 'div'}
	{id}
	style={`--node-color: ${typeData.color}`}
	class={twMerge([
		'border-main-600 hover:bg-main-500/5 relative flex h-20 w-60 items-center justify-center border p-2 transition-all',
		'bg-main-900/20 backdrop-blur-sm',
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
