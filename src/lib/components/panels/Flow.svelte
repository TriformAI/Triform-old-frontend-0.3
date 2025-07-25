<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'
	import { type Component } from '$lib/types/resources'
	const { componentData }: { componentData: Component } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['execute', 'metadata', 'variables', 'triggers']} {componentData} />
	{/snippet}
</Panel>
