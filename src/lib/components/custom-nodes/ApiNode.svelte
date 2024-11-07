<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import APINode from '$lib/icons/APINode.svg';

	export let data: { name: string };
	export let selected: boolean = false;
</script>

<div class="p-2 rounded-full">
	<!-- <Handle type="target" position={Position.Top} /> -->
	<p class="absolute flex-shrink-0 w-full text-[0.5em] font-bold text-white right-16 top-7">
		{data.name} <span class="text-gray-400">v1</span>
	</p>
	<img
		src={APINode}
		alt="ApiNode"
		class={`rounded-full w-14 h-14 ${selected && 'shadow-lg shadow-green-800 duration-100 ease-linear'}`}
	/>
	<Handle type="source" position={Position.Bottom} />
</div>
