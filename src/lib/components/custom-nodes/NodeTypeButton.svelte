<script lang="ts">
	import { nodeTypes } from '$lib/constants/nodeTypes'

	type NodeType = (typeof nodeTypes)[number]

	let {
		nodeType,
		withBgColor = false,
		onclick,
		large = false
	}: {
		nodeType: NodeType
		withBgColor?: boolean
		onclick: () => void
		large?: boolean
	} = $props()
</script>

<button
	{onclick}
	type="button"
	class={[
		'group hover:bg-main-500/10 transition',
		'relative flex flex-col items-center',
		large ? 'justify-start' : 'justify-center',
		large ? 'h-auto w-64 px-8 py-4' : 'size-18 rounded-sm'
	]}
	id={`node-type-button-${nodeType.type}`}
>
	<nodeType.icon
		style={`color: ${nodeType.iconColor}`}
		class={[
			'text-main-300 group-hover:text-main-400 transition group-hover:scale-110',
			large ? 'size-7' : 'size-5'
		]}
	/>

	<span
		class={[
			'group-hover:text-main-200 font-medium transition',
			large ? 'text-main-300 text-base font-semibold' : 'text-sm'
		]}
	>
		{nodeType.label}
	</span>
	{#if large}
		<span
			class="text-main-400 group-hover:text-main-200 [&_b]:text-main-300 text-sm font-medium transition"
		>
			{@html nodeType.description}
		</span>
	{/if}
</button>
