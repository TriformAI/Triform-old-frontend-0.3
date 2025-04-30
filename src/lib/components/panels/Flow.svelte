<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'
</script>

<Panel {Icon}>
	{#snippet panels({ Execute, Metadata, Variables })}
		<Metadata />
		<Execute />
		<Variables />
	{/snippet}
</Panel>
