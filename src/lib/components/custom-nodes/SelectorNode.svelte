<script lang="ts">
	import IconActionNode from '~icons/material-symbols/square-rounded'
	import IconFlowNode from '~icons/material-symbols/change-history-rounded'
	import ComboBox from '../atoms/ComboBox.svelte'
	import { addDownstreamNode } from '$lib/stores/canvas.svelte'
	import CustomHandle from './CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import { nodes } from '$lib/stores/canvas.svelte'
	import { onMount } from 'svelte'
	import { clickOutside } from '$lib/utils/clickOutside'

	const { id, data } = $props()

	function cancel() {
		$nodes = $nodes.filter(node => node.id !== id)
	}

	function addNode(type: 'action' | 'agent') {
		addDownstreamNode('root', undefined, data.source_id)
	}
</script>

<CustomHandle {id} type="target" position={Position.Top} />

<div
	use:clickOutside
	onclick_outside={() => {
		cancel()
	}}
	class={[
		'selector grid w-64 origin-top scale-100 gap-4 rounded-lg  bg-zinc-800 p-4 text-sm text-zinc-100 transition-transform duration-200 ease-(--easing-circ)'
	]}
>
	<p><strong>Insert new…</strong></p>

	<div class="grid grid-cols-2 gap-2">
		<button
			class=" justify-center rounded-md bg-zinc-700 px-4 py-3"
			onclick={() => addNode('action')}
		>
			<IconActionNode class="size-5 rotate-45" />
			Action
		</button>

		<button
			class="justify-center rounded-md bg-zinc-700 px-4 py-3"
			onclick={() => addNode('agent')}
		>
			<IconFlowNode class="size-5" />
			Sub flow
		</button>
	</div>
</div>

<style>
	@starting-style {
		.selector {
			transform: scale(0);
		}
	}
</style>
