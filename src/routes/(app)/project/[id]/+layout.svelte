<script lang="ts">
	import Flow from '$lib/components/canvas/Flow.svelte'
	import ColResizer from '$lib/components/ColResizer.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Spinner from '$lib/components/Spinner.svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import BreadCrumbs from '$lib/components/canvas/Breadcrumbs.svelte'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { loadComponents } from '$lib/stores/library.svelte'
	import { initFlow, loadDrafts, loadProject } from '$lib/stores/canvas.svelte'

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
				class="bg-main-800 grid h-full grid-cols-[1fr_4px_600px] grid-rows-[1fr_auto] pt-1"
			>
				<div class="bg-main-900 grid place-items-center">
					<Flow bind:this={flowComponent} />
				</div>

				<ColResizer
					{gridContainer}
					onResizeEnd={() =>
						flowComponent?.fitView({
							maxZoom: 1,
							minZoom: 1,
							duration: 500
						})}
				/>

				<PropsPanel />
			</div>
		</SvelteFlowProvider>
	</main>
</div>

<Confirm />
