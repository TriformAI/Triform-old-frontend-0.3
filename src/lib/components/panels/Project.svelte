<script lang="ts">
	import Panel from '$lib/components/panels/Panel.svelte'
	import Variables from '$lib/components/panels/items/Variables/Root.svelte'
	import ProjectSettings from '$lib/components/panels/items/ProjectSettings.svelte'
</script>

<Panel title="Project" desc="A project is your canvas">
	{#snippet slot({ PanelItem })}
		<PanelItem title="Project settings">
			<ProjectSettings />
		</PanelItem>

		<PanelItem title="Variables">
			<Variables />
		</PanelItem>
	{/snippet}
</Panel>
