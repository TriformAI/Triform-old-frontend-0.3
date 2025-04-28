<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
</script>

<Panel {Icon}>
	{#snippet panels({ Execute, Metadata })}
		<Execute />
		<Metadata />
	{/snippet}
</Panel>
