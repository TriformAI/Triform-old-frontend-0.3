<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import Item from './ListItem.svelte'
	import Dialog from './Dialog.svelte'
	import { getCurrentNodePath, getProject } from '$lib/stores/canvas.svelte'

	let dialog = $state<HTMLDialogElement>()

	const { nodeId }: { nodeId: string } = $props()

	// triggers can only exist on top-level nodes
	const node = $derived(
		getProject()?.spec.nodes[nodeId === 'container' ? getCurrentNodePath().pop()! : nodeId]
	)

	// const triggers = $derived(
	// 	page.data.triggers?.filter((t: Trigger) => t.spec.component_id === componentData.id)
	// )
	const triggers = $derived(node?.triggers ?? {})
</script>

<Dialog bind:dialog {nodeId} />

<PanelItem {nodeId} title="Triggers" isListContainer onAddClick={() => dialog?.showModal()}>
	<div class="flex flex-col gap-4">
		{#each Object.entries(triggers) as [triggerId, trigger]}
			<Item {nodeId} {triggerId} {trigger} />
		{:else}
			<p class="text-main-500 text-sm text-center">No triggers yet</p>
		{/each}
	</div>
</PanelItem>
