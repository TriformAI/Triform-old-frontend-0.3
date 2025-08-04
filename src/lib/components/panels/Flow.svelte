<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'
	import type { z } from 'zod'
	import type { resolvedFlowModel } from '$lib/schemas'
	const { componentData }: { componentData: z.infer<typeof resolvedFlowModel> } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panelItems(PanelItems)}
		<PanelItems items={['execute', 'metadata', 'variables', 'triggers']} {componentData} />
	{/snippet}
</Panel>
