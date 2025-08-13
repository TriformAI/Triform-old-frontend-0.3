<script lang="ts">
	import { components } from '$lib/stores/library.svelte'
	import { InfiniteLoader, LoaderState } from 'svelte-infinite'
	import ComponentCard from './ComponentCard.svelte'
	import type { Component } from '$lib/types/resources'
	import InputField from '../../atoms/InputField.svelte'
	import InnerNode from '$lib/components/custom-nodes/InnerNode.svelte'
	import { twMerge } from 'tailwind-merge'

	let { class: classes }: { class?: string } = $props()

	const loaderState = new LoaderState()

	let loadedSoFar = $state(0)

	const loadedComponents = $state<Component[]>([])

	// super rudimentary search for now
	const filteredComponents = $derived(
		loadedComponents.filter(
			component =>
				component.meta.name.toLowerCase().includes(search.toLowerCase()) ||
				component.meta.intention?.purpose?.toLowerCase().includes(search.toLowerCase())
		)
	)

	const loadMore = async () => {
		const size = 20
		loadedComponents.push(...components.slice(loadedSoFar, loadedSoFar + size))
		loadedSoFar += size
	}

	let search = $state('')
</script>

<!-- Keep these, needed for preview of components on drag -->
<div class="absolute left-[-999em]">
	<InnerNode type="flow" id="flow-preview" name="Flow" />
	<InnerNode type="action" id="action-preview" name="Action" />
	<InnerNode type="agent" id="agent-preview" name="Agent" />
</div>

<div
	class={twMerge(
		'border-main-800 custom-scrollbar scroll-gutter-stable bg-main-950/60 relative ms-2 mb-2 grid overflow-y-auto rounded-lg border',
		classes
	)}
>
	<InfiniteLoader {loaderState} triggerLoad={loadMore} loopMaxCalls={100}>
		<div
			class="bg-main-900/75 sticky top-0 z-10 mb-4 flex w-full flex-row gap-2 px-4 pt-4 backdrop-blur-xs"
		>
			<InputField
				placeholder="Search component library"
				containerClass="w-full"
				bind:value={search}
			/>
		</div>

		<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 px-4">
			{#each filteredComponents as component}
				<ComponentCard {component} />
			{/each}
		</div>
	</InfiniteLoader>

	<div
		class="from-main-950/75 to-main-900/0 pointer-events-none sticky bottom-0 left-0 h-20 w-full rounded-lg bg-gradient-to-t"
	></div>
</div>
