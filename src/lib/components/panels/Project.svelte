<script lang="ts">
	import Panel from './Panel.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'

	const items = [
		{
			title: 'Project settings',
			component: ProjectSettings
		}
	]
</script>

<Panel {items} />
