<script>
	import { SvelteFlow, Background, Controls } from '@xyflow/svelte'
	import '@xyflow/svelte/dist/style.css'

	let nodes = $state.raw([
		{
			id: '1',
			type: 'input',
			position: { x: 0, y: 0 },
			data: { label: 'Hello' }
		},
		{
			id: '2',
			type: 'output',
			position: { x: 100, y: 100 },
			data: { label: 'World' }
		}
	])

	let edges = $state.raw([
		{ id: '1-2', source: '1', target: '2', type: 'smoothstep', label: 'to the' }
	])
</script>

<div style="height: 100vh; width: 100vw">
	<SvelteFlow bind:nodes bind:edges fitView>
		<Background />
		<Controls />
	</SvelteFlow>
</div>
