<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
	import { type Component } from '$lib/types/resources'
	const { componentData }: { componentData: Component } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['execute', 'metadata']} {componentData} />
	{/snippet}
</Panel>
