<script lang="ts">
	import Panel from './Panel.svelte'
	import { page } from '$app/state'

	const componentData = $derived(page.data.project!)
</script>

<Panel {componentData}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['projectSettings']} {componentData} />
	{/snippet}
</Panel>
