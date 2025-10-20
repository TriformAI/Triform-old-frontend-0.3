<script lang="ts">
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute/Root.svelte'
	import Metadata from './items/Metadata/Root.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'
	import Triggers from './items/Triggers/Root.svelte'
	import IO from './items/IO/Root.svelte'
	import AgentSettings from './items/AgentSettings/Root.svelte'
	import IconExecute from '~icons/material-symbols/play-arrow-rounded'
	import IconCode from '~icons/material-symbols/code-rounded'
	import IconMetadata from '~icons/material-symbols/info-outline'
	import IconTriggers from '~icons/mdi/lightning-bolt'
	import IconVariables from '~icons/material-symbols/vpn-key-rounded'
	import IconIO from '~icons/material-symbols/input-circle-rounded'
	import IconSettings from '~icons/mdi/tune-vertical'
	import { slide } from 'svelte/transition'

	import { openPanelItem, toggleOpenPanelItem } from '$lib/stores/panel.svelte'
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
		metadata: { label: 'Information', component: Metadata, icon: IconMetadata },
		projectSettings: { label: 'Settings', component: ProjectSettings, icon: IconSettings },
		variables: { label: 'Global Variables', component: Variables, icon: IconVariables },
		triggers: { label: 'Triggers', component: Triggers, icon: IconTriggers },
		io: { label: 'IO', component: IO, icon: IconIO },
		agentSettings: { label: 'Agent Settings', component: AgentSettings, icon: IconSettings }
	}

	let { items, nodeId, showNav = true }: Props = $props()

	// Get active component from openPanelItem
	const isActive = $derived((key: string) => openPanelItem.value === key)

	let isMounted = $state(false)

	onMount(() => {
		if (!openPanelItem.value && items.length > 0) {
			// Default to 'execute' if available, otherwise use the first available item
			const defaultItem = items.includes('execute') ? 'execute' : items[0]
			toggleOpenPanelItem(defaultItem)
		}

		setTimeout(() => {
			isMounted = true
		}, 0)
	})

	function onNavClick(key: PanelComponent) {
		toggleOpenPanelItem(key)

		// Scroll to active component if enabled and not already visible
		if (openPanelItem.value === key) {
			document
				.querySelector(`[data-panel-item="${key}"]`)
				?.scrollIntoView({ behavior: 'smooth', block: 'end' })
		}
	}
</script>

<div class={['custom-scrollbar scroll-gutter-stable relative flex flex-row overflow-y-auto']}>
	{#if showNav}
		<nav class="border-main-800 sticky top-0 z-20 mb-auto h-full">
			<!-- <div class="bg-main-850/50 border-main-800 h-6 w-full rounded-br border-r border-b"></div> -->
			<ul class="h-full">
				{#each items as key (key)}
					{@const item = allComponents[key]}
					{@const Icon = item.icon}
					<li
						class={[
							'border-main-800 border-r border-b',
							'hover:bg-main-800/20',
							'group/nav-btn box-content transition',
							'rounded-r nth-last-2:rounded-br-none',
							isActive(key)
								? 'text-main-100 border-r-transparent bg-transparent'
								: 'bg-main-850/80 text-main-400 hover:text-main-300 border-r-main-800'
						]}
					>
						<button
							class="grid size-12 place-items-center transition group-active/nav-btn:scale-90"
							onclick={() => onNavClick(key)}
							aria-label={item.label}
							data-balloon-pos="right"
							data-balloon-nofocus
						>
							<Icon class="size-6" />
						</button>
					</li>
				{/each}
				<li class="border-main-800 h-full border-r"></li>
			</ul>
		</nav>
	{/if}

	<div class="border-main-800 z-10 -ms-px flex-1">
		{#if !openPanelItem.value}
			<p
				class="text-main-500 animate-fade-in absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm"
			>
				No panel items selected
			</p>
		{/if}

		{#each items as key (key)}
			{@const Component = allComponents[key].component}
			{#if isActive(key)}
				<div
					data-panel-item={key}
					class={['relative z-10 h-full']}
					transition:slide={{ axis: 'y' }}
				>
					<Component {nodeId} />
				</div>
			{/if}
		{/each}
	</div>
</div>
