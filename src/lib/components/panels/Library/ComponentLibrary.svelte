<script lang="ts">
	import { components } from '$lib/stores/library.svelte'
	import { InfiniteLoader, LoaderState } from 'svelte-infinite'
	import ComponentCard from './ComponentCard.svelte'
	import type { Component } from '$lib/types/agent'
	import InputField from '../../atoms/InputField.svelte'

	const loaderState = new LoaderState()
	let loadedSoFar = $state(0)
	const loadedComponents = $state<Component['meta'][]>([])
	// super rudimentary search for now
	const filteredComponents = $derived(
		loadedComponents.filter(
			component =>
				component.name.toLowerCase().includes(search.toLowerCase()) ||
				component.intention?.purpose?.toLowerCase().includes(search.toLowerCase())
		)
	)
	const loadMore = async () => {
		const size = 20
		loadedComponents.push(...components.slice(loadedSoFar, loadedSoFar + size))
		loadedSoFar += size
	}

	let search = $state('')
</script>

<InfiniteLoader {loaderState} triggerLoad={loadMore} loopMaxCalls={100}>
	<div class="bg-main-900/60 sticky -top-5 pt-1 pb-4 backdrop-blur-xs">
		<div
			class="[&_div]:bg-main-700 my-4 flex w-full flex-row items-center gap-2 [&_div]:h-[1px] [&_div]:flex-1"
		>
			<div></div>
			<h2 class="text-main-400 text-sm font-bold uppercase">Component library</h2>
			<div></div>
		</div>
		<div class="flex w-full flex-row gap-2 px-4">
			<InputField placeholder="Search" containerClass="w-full" bind:value={search} />
		</div>
	</div>
	<div class="grid h-full grid-cols-1 gap-4 overflow-y-auto px-4 @2xl:grid-cols-2">
		{#each filteredComponents as component}
			<ComponentCard meta={component} />
		{/each}
	</div>
</InfiniteLoader>
