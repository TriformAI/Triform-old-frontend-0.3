<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
	import type { z } from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'
	const { componentData }: { componentData: z.infer<typeof resolvedComponentModel> } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems
			items={['execute', 'codeEditor', 'metadata', 'variables', 'triggers']}
			{componentData}
		/>
	{/snippet}
</Panel>
