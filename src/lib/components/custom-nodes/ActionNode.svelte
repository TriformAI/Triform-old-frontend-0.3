<script lang="ts">
	import Node from './Node.svelte'
	import IconAction from '~icons/mdi/rhombus'

	const props = $props()
</script>

<Node {...props} --node-color="var(--color-main-300)">
	{#snippet icon()}
		<IconAction class="text-main-300" />
	{/snippet}
</Node>
