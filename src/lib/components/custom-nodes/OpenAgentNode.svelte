<script lang="ts">
	import GroupNode from './GroupNode.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'

	const props = $props()
</script>

<GroupNode {...props}>
	{#snippet icon()}
		<IconChangeHistory class="mb-1 h-6 w-6 text-indigo-500" />
	{/snippet}
</GroupNode>
