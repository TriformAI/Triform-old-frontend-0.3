<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import AgentNode from '$lib/icons/AgentNode.svg';

	export let data: { name: string };
	export let selected: boolean = false;


</script>

<div class="p-2">
	<Handle type="target" position={Position.Top} />
	<p class="absolute flex-shrink-0 w-full text-[0.5em] font-bold text-white right-20 top-7">
		{data.name} <span class="text-gray-400">v1</span>
	</p>
	<img
		src={AgentNode}
		alt="AgentNode"
		class={`rounded-full w-14 h-14 ${selected && 'shadow-lg shadow-red-800 duration-100 ease-linear'}`}
	/>
	<Handle type="source" position={Position.Bottom} />
</div>
