<script lang="ts">
	import { type Component } from '$lib/types/agent'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute/Root.svelte'
	import Metadata from './items/Metadata.svelte'
	import ProjectSettings from './items/ProjectSettings.svelte'
	import Variables from './items/Variables/Root.svelte'
	import Triggers from './items/Triggers/Root.svelte'

	import IconExecute from '~icons/mdi/play-circle-outline'
	import IconCode from '~icons/mdi/code-braces'
	import IconMetadata from '~icons/mdi/code-tags'
	import IconTriggers from '~icons/mdi/lightning-bolt'
	import IconVariables from '~icons/mdi/variable'
	import IconProject from '~icons/mdi/shape'

	import {
		openPanelItems,
		toggleOpenPanelItem,
		type OpenPanelItems
	} from '$lib/stores/panel.svelte'
	import { onMount } from 'svelte'

	type PanelComponent = keyof typeof allComponents

	interface Props {
		items: PanelComponent[]
		componentData: Component
		showNav?: boolean
	}

	const allComponents = {
		codeEditor: { label: 'Code', component: CodeEditor, icon: IconCode },
		execute: { label: 'Execute', component: Execute, icon: IconExecute },
		metadata: { label: 'Metadata', component: Metadata, icon: IconMetadata },
		projectSettings: { label: 'Project Settings', component: ProjectSettings, icon: IconProject },
		variables: { label: 'Variables', component: Variables, icon: IconVariables },
		triggers: { label: 'Triggers', component: Triggers, icon: IconTriggers }
	}

	const { items, componentData, showNav = true }: Props = $props()
	$inspect(componentData)

	// Get component type from resource
	const componentType = $derived(componentData.resource.split('/')[0]) as keyof OpenPanelItems

	// Get active components from openPanelItems or default to ['execute']
	const activeComponents = $derived(
		componentType === 'project' ? ['projectSettings'] : (openPanelItems[componentType] ?? [''])
	)

	let isMounted = $state(false)

	onMount(() => {
		if (activeComponents.length === 0) {
			toggleOpenPanelItem(componentType, 'execute')
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

<div class={['relative grid items-start', showNav ? 'grid-cols-[auto_1fr]' : 'grid-cols-1']}>
	{#if showNav}
		<nav class="border-main-800 sticky top-20 border-e">
			<ul>
				{#each items as key (key)}
					{@const Icon = allComponents[key].icon}
					<li
						class={[
							'border-b-main-800 border-b',
							activeComponents.includes(key) ? 'bg-main-850/80' : ''
						]}
					>
						<button
							title={allComponents[key].label}
							class="grid size-12 place-items-center"
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
					<Component {componentData} />
				</div>
			</div>
		{/each}
	</div>
</div>
