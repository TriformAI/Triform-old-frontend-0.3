<script lang="ts">
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute/Root.svelte'
	import Metadata from './items/Metadata.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'
	import Triggers from './items/Triggers/Root.svelte'
	import IO from './items/IO/Root.svelte'
	import AgentSettings from './items/AgentSettings.svelte'

	import IconExecute from '~icons/mdi/lightning-bolt'
	import IconCode from '~icons/material-symbols/code-rounded'
	import IconMetadata from '~icons/mdi/clipboard-edit'
	import IconTriggers from '~icons/material-symbols/input-rounded'
	import IconVariables from '~icons/material-symbols/vpn-key-rounded'
	import IconProject from '~icons/mdi/shape'
	import IconIO from '~icons/material-symbols/input-circle-rounded'
	import IconAgentSettings from '~icons/mdi/tune-vertical'

	import {
		openPanelItems,
		toggleOpenPanelItem,
		type OpenPanelItems
	} from '$lib/stores/panel.svelte'
	import { onMount } from 'svelte'

	type PanelComponent = keyof typeof allComponents

	interface Props {
		items: PanelComponent[]
		nodeId: string
		showNav?: boolean
	}

	const allComponents = {
		codeEditor: { label: 'Code', component: CodeEditor, icon: IconCode },
		execute: { label: 'Execute', component: Execute, icon: IconExecute },
		metadata: { label: 'Metadata', component: Metadata, icon: IconMetadata },
		projectSettings: { label: 'Project Settings', component: ProjectSettings, icon: IconProject },
		variables: { label: 'Variables', component: Variables, icon: IconVariables },
		triggers: { label: 'Triggers', component: Triggers, icon: IconTriggers },
		io: { label: 'IO', component: IO, icon: IconIO },
		agentSettings: { label: 'Agent Settings', component: AgentSettings, icon: IconAgentSettings }
	}

	let { items, nodeId, showNav = true }: Props = $props()

	const componentData = $derived(getVisibleComponent(nodeId))

	// Get component type from resource
	const componentType = $derived(componentData?.resource?.split('/')[0]) as keyof OpenPanelItems

	// Get active components from openPanelItems or default to first available item
	const activeComponents = $derived(
		componentType === 'project'
			? ['projectSettings']
			: openPanelItems[componentType]?.length > 0
				? openPanelItems[componentType]
				: []
	)

	let isMounted = $state(false)

	onMount(() => {
		if (activeComponents.length === 0 && items.length > 0) {
			// Default to 'execute' if available, otherwise use the first available item
			const defaultItem = items.includes('execute') ? 'execute' : items[0]
			toggleOpenPanelItem(componentType, defaultItem)
		}

		setTimeout(() => {
			isMounted = true
		}, 0)
	})

	function onNavClick(key: PanelComponent) {
		toggleOpenPanelItem(componentType, key)

		// Scroll to active component if enabled and not already visible
		if (activeComponents.includes(key)) {
			document
				.querySelector(`[data-panel-item="${key}"]`)
				?.scrollIntoView({ behavior: 'smooth', block: 'end' })
		}
	}
</script>

<div
	class={[
		'relative grid h-[calc(100%-4rem)] items-start',
		showNav ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'
	]}
>
	{#if showNav}
		<nav class="border-main-800 h-full border-e">
			<ul>
				{#each items as key (key)}
					{@const Icon = allComponents[key].icon}
					<li
						class={[
							'border-b-main-800 border-b',
							'hover:bg-main-800/50',
							'group/nav-btn transition',
							activeComponents.includes(key)
								? 'bg-main-850/90 text-main-100'
								: 'text-main-400 hover:text-main-300'
						]}
					>
						<button
							title={allComponents[key].label}
							class="grid size-12 place-items-center transition group-active/nav-btn:scale-90"
							onclick={() => onNavClick(key)}
						>
							<Icon class="size-6" />
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}

	<div class="border-main-800 z-10 -ms-px border-s">
		{#if activeComponents.length === 0}
			<p
				class="text-main-500 animate-fade-in absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm"
			>
				No panel items selected
			</p>
		{/if}

		{#each items as key}
			{@const Component = allComponents[key].component}
			<div
				data-panel-item={key}
				class={[
					' relative z-10 overflow-hidden starting:h-0',
					activeComponents.includes(key) ? 'max-h-max' : 'h-0',
					isMounted && 'transition-height duration-500 ease-(--easing-circ)'
				]}
			>
				<div class="border-b-main-800 border-b">
					<Component {nodeId} />
				</div>
			</div>
		{/each}
	</div>
</div>
