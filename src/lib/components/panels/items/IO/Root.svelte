<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import List from './List.svelte'
	import IconWarning from '~icons/material-symbols/warning-rounded'
	import type * as z from 'zod'
	import { resolvedComponentModel, isAction, isAgent } from '$lib/schemas'
	import { getVisibleComponent, agentHasHardBoundInputs, overwriteAgentHasHardBoundInputs } from '$lib/stores/canvas.svelte'
	import Button from '$lib/components/atoms/Button.svelte'

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
		{:else if isAgent(component) && nodeId === 'container'}
			<div class="flex flex-col gap-2 mb-6">
				<p class="text-main-400 text-sm">
					Sometimes you might want some tool inputs to be "hard-bound" to a specific input of the agent
					so the LLM doesn't see them. You can enable this by clicking the button below and then connecting
					the tool input to the agent input.
				</p>
				<Button
					variation="primary"
					disabled={agentHasHardBoundInputs()}
					onClick={() => overwriteAgentHasHardBoundInputs(true)}
					tooltip={agentHasHardBoundInputs() ? 'Pre-defined tool inputs are already enabled, remove the edges to disable it' : undefined}
				>
					Add pre-defined tool inputs
				</Button>
			</div>
		{/if}
		<div class="flex flex-col gap-y-8">
			<List {nodeId} type="input" readonly={isAction(component)} />
			<List {nodeId} type="output" readonly={isAction(component)} />
		</div>
	</div>
</PanelItem>
