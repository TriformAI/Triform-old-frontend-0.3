<script lang="ts">
	import Flow from '$lib/components/canvas/Flow.svelte'
	import ColResizer from '$lib/components/ColResizer.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import Spinner from '$lib/components/Spinner.svelte'
	import { initFlow, loadDrafts } from '$lib/stores/canvas.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import { sleep } from '$lib/utils/sleep'
	import { onMount } from 'svelte'
	import type { Component } from '$lib/types/agent'
	import { loadComponents } from '$lib/stores/library.svelte.js'

	const { data } = $props()
	let isLoaded = $state(false)

	$effect(() => {
		if (data.drafts) {
			loadDrafts(data.drafts)
		}
	})

	onMount(() => {
		loadComponents(data.components ?? [])
	})

	$effect(() => {
		;(async () => {
			if (!data.project) return
			await initFlow(data.project, data.positions)
			flowComponent?.fitView({
				maxZoom: 1,
				minZoom: 1
			})
			await sleep(500)
			isLoaded = true
		})()
	})

	let gridContainer = $state<HTMLDivElement>()
	let flowComponent = $state<Flow>()
</script>

<svelte:head>
	<title>{data.project?.meta?.name || 'Project'} | Triform</title>
</svelte:head>

<SvelteFlowProvider>
	<div
		bind:this={gridContainer}
		class="bg-main-800 grid h-full grid-cols-[1fr_4px_600px] grid-rows-[1fr_auto] pt-1"
	>
		<div class="bg-main-900 grid place-items-center">
			{#if isLoaded}
				<Flow bind:this={flowComponent} />
			{:else}
				<Spinner />
			{/if}
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

<Confirm />
