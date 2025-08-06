<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import Item from './ListItem.svelte'
	import { page } from '$app/state'
	import type { Trigger, Component } from '$lib/types/resources'
	import Dialog from './Dialog.svelte'
	import type * as z from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'

	let dialog = $state<HTMLDialogElement>()

	const { componentData }: { componentData: z.infer<typeof resolvedComponentModel> } = $props()

	// const triggers = $derived(
	// 	page.data.triggers?.filter((t: Trigger) => t.spec.component_id === componentData.id)
	// )
	const triggers = []
</script>

<Dialog bind:dialog {componentData} />

<PanelItem {componentData} title="Triggers" isListContainer onAddClick={() => dialog?.showModal()}>
	<div class="flex flex-col gap-4">
		{#each triggers as trigger}
			<Item {componentData} {trigger} />
		{:else}
			<p class="text-main-500 text-sm text-center">No triggers yet</p>
		{/each}
	</div>
</PanelItem>
