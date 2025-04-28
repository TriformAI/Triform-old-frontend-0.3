<script lang="ts">
	import Panel from './Panel.svelte'
</script>

<Panel>
	{#snippet panels({ ProjectSettings })}
		<ProjectSettings />
	{/snippet}
</Panel>
