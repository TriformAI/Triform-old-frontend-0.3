<script lang="ts">
	import Flow from '$lib/components/canvas/Flow.svelte'
	import 'balloon-css'
	import GridResizerHandle from '$lib/components/GridResizerHandle.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import BreadCrumbs from '$lib/components/canvas/Breadcrumbs.svelte'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { loadComponents } from '$lib/stores/library.svelte'
	import { refreshFlow, setProject } from '$lib/stores/canvas.svelte'
	import ComponentLibrary from '$lib/components/panels/Library/ComponentLibrary.svelte'
	import { debounce } from '$lib/utils/debounce'
	import { onMount } from 'svelte'
	import { sleep } from '$lib/utils/sleep.js'
	import { page } from '$app/state'
	import type * as z from 'zod'
	import { projectModel } from '$lib/schemas'

	const { data, children } = $props()

	let gridContainer = $state<HTMLDivElement>()
	let flowComponent = $state<Flow>()

	onMount(() => {
		loadComponents(data.components ?? [])
	})

	// ensure project is set before anything else happens
	$effect.pre(() => {
		setProject(page.data.project as z.infer<typeof projectModel>)
	})

	const DEFAULT_PROPS_PANEL_WIDTH = 600
	const DEFAULT_COMPONENT_PANEL_HEIGHT = 180
	const GUTTER_SIZE = 8

	let propsPanelWidth = $state(
		Number(localStorage.getItem('propsPanelWidth') || DEFAULT_PROPS_PANEL_WIDTH)
	)

	let componentPanelHeight = $state(
		Number(localStorage.getItem('componentsLibPanelHeight') || DEFAULT_COMPONENT_PANEL_HEIGHT)
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
				style={`grid-template-columns: 1fr ${GUTTER_SIZE}px ${propsPanelWidth}px; grid-template-rows: 1fr ${GUTTER_SIZE}px ${componentPanelHeight}px`}
				class={`bg-main-850 grid h-full pt-1 ease-(--easing-circ)`}
			>
				<div
					class="bg-main-900 border-main-800 flow-container ms-2 grid place-items-center overflow-hidden border"
				>
					{#key page.url.pathname}
						<Flow bind:this={flowComponent} />
					{/key}
				</div>

				<GridResizerHandle
					name="propsPanel"
					axis="x"
					bind:size={propsPanelWidth}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
					onResizeEnd={debounce(() => {
						flowComponent?.fitView({
							maxZoom: 1,
							duration: 500
						})
					}, 300)}
				/>

				<PropsPanel class={propsPanelWidth <= 30 ? 'border-main-850' : ''} />

				<GridResizerHandle
					name="componentsLibPanel"
					axis="y"
					bind:size={componentPanelHeight}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
					onResizeEnd={debounce(() => {
						flowComponent?.fitView({
							maxZoom: 1,
							duration: 500
						})
					}, 300)}
				/>

				<ComponentLibrary class={propsPanelWidth <= 30 ? 'border-main-850' : ''} />
			</div>
		</SvelteFlowProvider>
	</main>
</div>

<Confirm />

<style>
	.flow-container {
		border-radius: var(--radius-lg);
	}

	/* Disable rounding in firefox to prevent weird visual glitches */
	@-moz-document url-prefix() {
		.flow-container {
			border-radius: 0;
		}
	}
</style>
