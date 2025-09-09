<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import List from './List.svelte'
	import IconWarning from '~icons/material-symbols/warning-rounded'
	import type * as z from 'zod'
	import { resolvedComponentModel, isAction } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	let { nodeId }: { nodeId: string } = $props()

	const component = $derived(getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>)
</script>

<PanelItem {nodeId} title="Input & output" tip="Specifies the interface of the component">
	<div>
		{#if isAction(component)}
			<div class="flex flex-row gap-2">
				<IconWarning class="text-warning-500 mt-1.5 inline-block size-4 shrink-0" />
				<p class="text-main-300 mb-6">
					The IO for actions is inferred from the source code, please update it in the code editor.
					This is a read-only view.
				</p>
			</div>
		{/if}
		<div class="flex flex-col gap-y-8">
			<List {nodeId} type="input" readonly={isAction(component)} />
			<List {nodeId} type="output" readonly={isAction(component)} />
		</div>
	</div>
</PanelItem>
