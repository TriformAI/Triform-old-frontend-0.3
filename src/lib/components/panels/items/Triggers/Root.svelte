<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import Item from './ListItem.svelte'
	import { page } from '$app/state'
	import type { Trigger, Component } from '$lib/types/resources'
	import Dialog from './Dialog.svelte'
	import type * as z from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	let dialog = $state<HTMLDialogElement>()

	const { nodeId }: { nodeId: string } = $props()

	const componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	// const triggers = $derived(
	// 	page.data.triggers?.filter((t: Trigger) => t.spec.component_id === componentData.id)
	// )
	const triggers = []
</script>

<Dialog bind:dialog {nodeId} />

<PanelItem {nodeId} title="Triggers" isListContainer onAddClick={() => dialog?.showModal()}>
	<div class="flex flex-col gap-4">
		{#each triggers as trigger}
			<Item {nodeId} {trigger} />
		{:else}
			<p class="text-main-500 text-sm text-center">No triggers yet</p>
		{/each}
	</div>
</PanelItem>
