<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import Actions from '$lib/icons/Actions.svg';

	export let data: { name: string };
	export let selected: boolean = false;
</script>

<div class="p-2 rounded-full">
	<Handle type="target" position={Position.Top} />
	<p class="absolute flex-shrink-0 w-full text-[0.5em] font-bold text-white right-20 top-7">
		{data.name} <span class="text-gray-400">v1</span>
	</p>
	<img
		src={Actions}
		alt="Actions"
		class={`rounded-full w-14 h-14 ${selected && 'shadow-lg shadow-slate-600 duration-100 ease-linear'}`}
	/>
	<!-- <Handle type="source" position={Position.Bottom} /> -->
</div>
