<script lang="ts">
	import CustomHandle from './CustomHandle.svelte';
	import Actions from '$lib/icons/Actions.svg';

	export let data: { name: string };
	export let selected: boolean = false;
</script>

<div class="p-2 rounded-full">
	<CustomHandle type="target" position="top" />
	<p class="absolute flex-shrink-0 w-full text-[0.5em] font-bold text-white right-20 top-7">
		{data.name} <span class="text-gray-400">v1</span>
	</p>
	<img
		src={Actions}
		alt="Actions"
		class={`rounded-full w-14 h-14 ${selected && 'shadow-lg shadow-slate-600 duration-100 ease-linear'}`}
	/>
</div>
