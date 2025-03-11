<script lang="ts">
	import Node from './Node.svelte'
	import IconAction from '~icons/mdi/rhombus'

	const props = $props()
</script>

<Node {...props}>
	{#snippet icon()}
		<IconAction class="text-main-300" />
	{/snippet}
</Node>
