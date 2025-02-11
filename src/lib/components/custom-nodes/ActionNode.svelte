<script lang="ts">
	import Node from './Node.svelte'
	import IconSquare from '~icons/material-symbols/square-rounded'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconSquare class="rotate-45 transform text-slate-300" />
	{/snippet}
</Node>
