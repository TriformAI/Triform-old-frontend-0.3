<script lang="ts">
	import APINode from '$lib/icons/APINode.svg';
	import CustomHandle from './CustomHandle.svelte';

	export let data: { name: string };
	export let selected: boolean = false;

	const { mode } = data;
</script>

<div class="p-2 rounded-full">
	<p class="absolute flex-shrink-0 w-full text-[8px] font-bold text-white right-16 top-7">
		{data.name} <span class="block text-gray-400">v1</span>
	</p>
	<img
		src={APINode}
		alt="ApiNode"
		class={`rounded-full w-11 h-11 p-2 border ${mode === 'success' ? 'border-primary-green' : mode === 'error' ? 'border-primary-red' : 'border-white'} ${selected ? `shadow-lg duration-100 ease-linear ${mode === 'success' ? 'shadow-primary-green' : mode === 'error' ? 'shadow-primary-red' : 'shadow-white'}` : ''}`}
	/>
	<CustomHandle type="source" position="bottom" />
</div>
