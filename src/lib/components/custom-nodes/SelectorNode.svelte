<script lang="ts">
	import IconActionNode from '~icons/material-symbols/square-rounded'
	import IconFlowNode from '~icons/material-symbols/change-history-rounded'
	import { addDownstreamNode, nodes } from '$lib/stores/canvas.svelte'
	import CustomHandle from './CustomHandle.svelte'
	import { Position } from '@xyflow/svelte'
	import { clickOutside } from '$lib/utils/clickOutside'

	const { id, data } = $props()

	function cancel() {
		$nodes = $nodes.filter(node => node.id !== id)
	}

	function addNode(_type: 'action' | 'agent') {
		addDownstreamNode('root', undefined, data.source_id)
	}
</script>

<CustomHandle {id} type="target" position={Position.Top} />

<div
	use:clickOutside
	onclickOutside={() => {
		cancel()
	}}
	class={[
		'selector bg-main-800 text-main-100 grid w-64 origin-top scale-100 gap-4 rounded-lg p-4 text-sm transition-transform duration-200 ease-(--easing-circ)'
	]}
>
	<p><strong>Insert new…</strong></p>

	<div class="grid grid-cols-2 gap-2">
		<button
			class=" bg-main-700 justify-center rounded-md px-4 py-3"
			onclick={() => addNode('action')}
		>
			<IconActionNode class="size-5 rotate-45" />
			Action
		</button>

		<button
			class="bg-main-700 justify-center rounded-md px-4 py-3"
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
