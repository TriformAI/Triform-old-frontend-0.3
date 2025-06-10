<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import type { Component } from '$lib/types/agent'
	import Item from './ListItem.svelte'
	import { page } from '$app/state'
	import type { Trigger } from '$lib/types/project'
	import Dialog from './Dialog.svelte'

	let dialog = $state<HTMLDialogElement>()

	const { componentData }: { componentData: Component } = $props()

	const triggers = page.data.modifiers.filter(m => ['endpoint/v1', 'cron/v1'].includes(m.resource))
</script>

<PanelItem {componentData} title="Triggers" isListContainer onAddClick={() => dialog?.showModal()}>
	<div class="flex flex-col gap-4">
		{#each triggers as trigger}
			<Item {componentData} {trigger} />
		{:else}
			<Dialog bind:dialog />
			<p class="text-main-500 text-sm text-center">No triggers yet</p>
		{/each}
	</div>
</PanelItem>
