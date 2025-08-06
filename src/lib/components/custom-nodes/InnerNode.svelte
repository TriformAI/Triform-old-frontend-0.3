<script lang="ts">
	import IconAction from '~icons/mdi/rhombus'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconAgent from '~icons/material-symbols/psychology-rounded'
	import { twMerge } from 'tailwind-merge'

	const {
		type,
		selected = false,
		class: classes,
		id,
		openFn,
		data
	}: {
		type: 'action' | 'flow' | 'agent'
		selected?: boolean
		class?: string
		id?: string
		openFn?: () => void
		data: NodeData | MetaNodeData
	} = $props()

	const borderClass = $derived.by(() => {
		return ''
		// if (!nodeState) return ''

		// return {
		// 	success: 'border-emerald-500',
		// 	error: 'border-red-500',
		// 	running: 'border-accent-500'
		// }[nodeState]
	})

	const typeData = $derived.by(() => {
		return {
			action: {
				icon: IconAction,
				color: 'var(--color-main-300)',
				shape: 'circle'
			},
			flow: {
				icon: IconFlow,
				color: 'var(--color-accent-300)',
				iconColor: 'var(--color-accent-500)',
				shape: 'square'
			},
			agent: {
				icon: IconAgent,
				color: 'var(--color-warning-300)',
				shape: 'circle'
			}
		}[type]
	})
</script>

<svelte:element
	this={openFn ? 'button' : 'div'}
	{id}
	style={`--node-color: ${typeData.color}`}
	class={twMerge([
		'relative flex h-20 w-60 items-center justify-center border border-[var(--node-color)] p-2 transition-all',
		typeData.shape === 'circle' && 'rounded-full',
		typeData.shape === 'square' && 'rounded-md',
		borderClass,
		classes
	])}
	style:background-color={selected
		? 'color-mix(in oklab, color-mix(in oklab, var(--node-color) 40%, black) 50%, transparent)'
		: undefined}
	ondblclickcapture={openFn}
>
	<span class="flex flex-row items-center justify-center gap-3">
		<typeData.icon
			class="size-5 drop-shadow-[0px_0px_10px_var(--node-color)]"
			style={`color: ${typeData.iconColor ?? typeData.color}`}
		/>
		<span class="truncate">{data?.trinode?.spec.meta.name || 'Untitled'}</span>
	</span>
</svelte:element>
