<script lang="ts">
	import { Handle } from '@xyflow/svelte';

	export let type: 'source' | 'target';
	export let position: 'top' | 'bottom' | 'left' | 'right';
	export let id: string | undefined;
	export let style: string | undefined;
</script>

<div class="relative">
	<div
		class="relative w-2 h-2 border border-white rounded-full left-6 bottom-0.5 bg-brand-primary-dark-gray"
	>
		<Handle
			{type}
			{position}
			{id}
			style="width: 30px; height: 20px"
			class={`z-50 opacity-0 ${type === 'source' ? 'bottom-2' : 'top-2'}`}
		/>
	</div>
</div>

<style>
</style>
