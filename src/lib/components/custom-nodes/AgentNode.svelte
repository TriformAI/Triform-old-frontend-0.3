<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import AgentNode from '$lib/icons/AgentNode.svg';
	import CustomHandle from './CustomHandle.svelte';

	export let data: { name: string };
	export let selected: boolean = false;
</script>

<div class="p-2">
	<CustomHandle type="target" position="top" />
	<p class="absolute flex-shrink-0 w-full text-[0.5em] font-bold text-white right-20 top-7">
		{data.name} <span class="text-gray-400">v1</span>
	</p>
	<img
		src={AgentNode}
		alt="AgentNode"
		class={`rounded-full w-12 h-12 ${selected && 'shadow-lg shadow-red-800 duration-100 ease-linear'}`}
	/>
	<CustomHandle type="source" position="bottom" />
</div>
