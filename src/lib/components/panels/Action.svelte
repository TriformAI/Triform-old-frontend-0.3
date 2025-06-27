<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
	import { type Component } from '$lib/types/agent'
	const { componentData }: { componentData: Component } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems
			items={['execute', 'codeEditor', 'metadata', 'variables', 'triggers']}
			{componentData}
		/>
	{/snippet}
</Panel>
