<script lang="ts">
	import { nodeTypes } from '$lib/constants/nodeTypes'

	type NodeType = (typeof nodeTypes)[number]

	interface Props {
		nodeType: NodeType
		withBgColor?: boolean
		onclick: () => void
	}

	let { nodeType, withBgColor = false, onclick }: Props = $props()
</script>

<button
	{onclick}
	type="button"
	class={['group hover:bg-main-500/10 grid size-18 place-items-center rounded-sm transition']}
>
	<nodeType.icon
		style={`color: ${nodeType.iconColor}`}
		class="text-main-300 group-hover:text-main-400 size-5 -translate-y-3.5 transition group-hover:scale-110"
	/>

	<span
		class="text-main-400 group-hover:text-main-200 absolute translate-y-3.5 text-sm font-medium transition"
	>
		{nodeType.label}
	</span>
</button>
