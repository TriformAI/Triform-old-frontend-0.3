<script lang="ts">
	import Window from '$lib/components/common/Window.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconChangeHistory from '~icons/material-symbols/change-history-rounded'
	import IconSquare from '~icons/material-symbols/square-rounded'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import type { Tab } from '$lib/components/atoms/Tabs.svelte'
	import schema from '$lib/dev/test-agent.json' // Adjust the path if needed
	import type { Agent, Action, Node } from '$lib/types/agent' // Adjust path to your generated types
	import { T, getTranslate } from '@tolgee/svelte'
	const { t } = getTranslate()

	// Define types for UI state
	type ActionItem = {
		resource: string
		meta: {
			name: string
			id: string
			version: number
		}
		spec: {
			source: string
			readme: string
			deps: string
			checksum: string
			streaming: boolean
		}
	}

	type AgentItem = {
		resource: 'agent/v1'
		meta: {
			name: string
			id: string
			version: number
		}
		spec: {
			readme: string
			nodes: {
				[key: string]: {
					component_id: string
					component_version: number
					inputs: string[]
					spec: Agent | Action
				}
			}
			outputs: string[]
		}
	}

	// Function to extract agents and actions
	function extractData(schema: Agent): { actions: ActionItem[]; agents: AgentItem[] } {
		let actions: ActionItem[] = []
		let agents: AgentItem[] = []

		function traverse(node: Node) {
			if (node.spec.resource === 'action/v1') {
				const action = node.spec as Action
				actions.push({
					resource: node.spec.resource,
					meta: action.meta,
					spec: { ...action.spec, checksum: action.spec.checksum ?? '' }
				})
			} else if (node.spec.resource === 'agent/v1') {
				const agent = node.spec as Agent
				agents.push({
					resource: node.spec.resource,
					meta: agent.meta,
					spec: {
						...agent.spec,
						nodes: Object.fromEntries(
							Object.entries(agent.spec.nodes).map(([key, node]) => [
								key,
								{
									...node,
									component_version: node.component_version ?? 0,
									inputs: node.inputs ?? []
								}
							])
						)
					}
				})
				// Recursively traverse nested nodes
				if (agent.spec.nodes) {
					Object.values(agent.spec.nodes).forEach(traverse)
				}
			}
		}

		// Start traversal from root
		if (schema.spec.nodes) {
			Object.values(schema.spec.nodes).forEach(traverse)
		}

		return { actions, agents }
	}

	const props = $props()

	// Extracted data
	const { actions, agents } = extractData(schema)

	// UI State
	let search: string = $state('')
	let activeTab: Tab = $state({ key: '1', label: 'Actions' })

	function handleDragStart(
		event: DragEvent,
		item: ActionItem | AgentItem,
		type: 'action-node' | 'agent-node'
	) {
		event.dataTransfer?.setData('application/json', JSON.stringify({ type, item }))
	}
</script>

<Window {...props}>
	{#snippet header()}
		<T keyName="component-toolbox-header" defaultValue="Components" />
	{/snippet}

	{#snippet body()}
		<div class="mb-4">
			<InputField
				label={$t('component-toolbox-input-label', '')}
				placeholder={$t('component-toolbox-input-placeholder', 'Search...')}
				type="text"
				bind:value={search}
			/>
		</div>

		<Tabs
			tabs={[
				{ key: '1', label: $t('component-toolbox-action-tab', 'Actions') },
				{ key: '2', label: $t('component-toolbox-agents-tab', 'Agents') }
			]}
			bind:activeTab
		/>

		<div class="my-6">
			{#if activeTab.key === '1'}
				{#each actions as action}
					<div
						class="flex flex-row items-center justify-between rounded-md px-5 py-4 text-sm hover:bg-zinc-800"
						draggable="true"
						ondragstart={event => handleDragStart(event, action, 'action-node')}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center gap-x-5">
							<IconSquare class="rotate-45 transform text-slate-300" />
							<p class="font-semibold text-zinc-200">{action.meta.name}</p>
						</div>
						<p class="cursor-pointer font-semibold text-white uppercase hover:font-bold">ReadMe</p>
					</div>
				{/each}
			{:else if activeTab.key === '2'}
				{#each agents as agent}
					<div
						class="flex flex-row items-center justify-between rounded-md px-5 py-4 text-sm hover:bg-zinc-800"
						draggable="true"
						ondragstart={event => handleDragStart(event, agent, 'agent-node')}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center gap-x-5">
							<IconChangeHistory class="mb-1 h-5 w-5 text-indigo-500" />
							<p class="font-semibold text-zinc-200">{agent.meta.name}</p>
						</div>
						<p class="cursor-pointer font-semibold text-white uppercase hover:font-bold">ReadMe</p>
					</div>
				{/each}
			{/if}
		</div>
	{/snippet}
</Window>
