<script lang="ts">
	import Flow from '$lib/components/canvas/Flow.svelte'
	import GridResizerHandle from '$lib/components/GridResizerHandle.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import BreadCrumbs from '$lib/components/canvas/Breadcrumbs.svelte'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { loadComponents } from '$lib/stores/library.svelte'
	import { initFlow, loadDrafts, loadProject } from '$lib/stores/canvas.svelte'
	import ComponentLibrary from '$lib/components/panels/Library/ComponentLibrary.svelte'

	import 'balloon-css'
	import { onMount } from 'svelte'
	import { sleep } from '$lib/utils/sleep.js'

	const { data, children } = $props()

	let gridContainer = $state<HTMLDivElement>()
	let flowComponent = $state<Flow>()

	let isLoaded = $state(false)

	$effect(() => {
		if (data.drafts) {
			loadDrafts(data.drafts)
		}
		if (data.project) {
			loadProject(data.project)
		}
	})

	onMount(() => {
		loadComponents(data.components ?? [])
	})

	$effect(() => {
		;(async () => {
			if (!data.project) return
			isLoaded = false
			await initFlow(data.project, data.positions)
			await sleep(0)
			flowComponent?.fitView({
				maxZoom: 1,
				minZoom: 1
			})
			isLoaded = true
		})()
	})

	const MIN_PROPS_PANEL_WIDTH = 600
	const MIN_COMPONENT_PANEL_HEIGHT = 180

	const propsPanelStartWidth = Number(
		localStorage.getItem('propsPanelWidth') || MIN_PROPS_PANEL_WIDTH
	)
	const componentPanelStartHeight = Number(
		localStorage.getItem('componentsLibPanelHeight') || MIN_COMPONENT_PANEL_HEIGHT
	)
</script>

{@render children()}

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar>
		<BreadCrumbs />
	</Navbar>

	<main class="overflow-hidden">
		<SvelteFlowProvider>
			<div
				bind:this={gridContainer}
				style={`grid-template-columns: 1fr 4px ${propsPanelStartWidth}px; grid-template-rows: 1fr 4px ${componentPanelStartHeight}px`}
				class={`bg-main-850 grid h-full pt-1`}
			>
				<div class="bg-main-900 ms-1 grid place-items-center overflow-hidden rounded-md">
					<Flow bind:this={flowComponent} />
				</div>

				<GridResizerHandle
					name="propsPanel"
					startSize={propsPanelStartWidth}
					defaultSize={MIN_PROPS_PANEL_WIDTH}
					axis="x"
					{gridContainer}
					onResizeEnd={() =>
						flowComponent?.fitView({
							maxZoom: 1,
							minZoom: 1,
							duration: 500
						})}
				/>

				<PropsPanel />

				<GridResizerHandle
					name="componentsLibPanel"
					startSize={componentPanelStartHeight}
					defaultSize={MIN_COMPONENT_PANEL_HEIGHT}
					axis="y"
					{gridContainer}
					onResizeEnd={() =>
						flowComponent?.fitView({
							maxZoom: 1,
							minZoom: 1,
							duration: 500
						})}
				/>

				<div class="bg-main-950/60 ms-1 mb-1 grid rounded-md">
					<ComponentLibrary />
				</div>
			</div>
		</SvelteFlowProvider>
	</main>
</div>

<Confirm />
