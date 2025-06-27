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

	import { openPanelItems, toggleOpenPanelItem } from '$lib/stores/panel.svelte'
	import { onMount } from 'svelte'

	const allComponents = {
		codeEditor: { label: 'Code', component: CodeEditor, icon: IconCode },
		execute: { label: 'Execute', component: Execute, icon: IconExecute },
		metadata: { label: 'Metadata', component: Metadata, icon: IconMetadata },
		projectSettings: { label: 'Project Settings', component: ProjectSettings, icon: IconProject },
		variables: { label: 'Variables', component: Variables, icon: IconVariables },
		triggers: { label: 'Triggers', component: Triggers, icon: IconTriggers }
	}

	type PanelComponent = keyof typeof allComponents

	interface Props {
		items: PanelComponent[]
		componentData: Component
	}

	const { items, componentData }: Props = $props()
	const componentType = $derived(componentData.resource.split('/')[0]) as
		| 'flow'
		| 'action'
		| 'project'

	const activeComponents = $derived(
		componentType === 'project'
			? ['projectSettings']
			: (openPanelItems[componentType] ?? ['execute'])
	)

	let isMounted = $state(false)
	onMount(() => {
		setTimeout(() => {
			isMounted = true
		}, 0)
	})
</script>

<div class="grid grid-cols-[auto_1fr] items-start">
	<nav class="border-main-800 sticky top-20 z-10 border-e">
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
						onclick={() => toggleOpenPanelItem(componentType, key)}
					>
						<Icon class="size-6" />
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="border-main-800 -ms-px border-s">
		{#each items as key}
			{@const Component = allComponents[key].component}
			<div
				class={[
					'overflow-hidden starting:h-0',
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
