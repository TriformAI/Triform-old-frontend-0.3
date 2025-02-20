<script lang="ts">
	import GroupNode from './GroupNode.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'

	const props = $props()
</script>

<GroupNode {...props}>
	{#snippet icon()}
		<IconChangeHistory class="text-accent-500 mb-1 h-6 w-6" />
	{/snippet}
</GroupNode>
