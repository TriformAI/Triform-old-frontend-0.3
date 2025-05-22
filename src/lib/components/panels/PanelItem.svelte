<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import { selected } from '$lib/stores/panel.svelte'
	import { getCurrentFlowId } from '$lib/stores/canvas.svelte'
	import { type Component } from '$lib/types/agent'
	import { browser } from '$app/environment'
	import { clone } from '$lib/utils/clone'

	export interface Props {
		componentData: Component
		title: string
		children: Snippet
		forceOpen?: boolean
	}

	let { componentData, title, children, forceOpen = false }: Props = $props()

	const nodeType = $derived.by(() => {
		if (!componentData) return

		if (componentData.resource === 'flow/v1') {
			return 'flow'
		}
		if (componentData.resource === 'action/v1') {
			return 'action'
		}
		if (componentData.resource === 'endpoint/v1') {
			return 'endpoint'
		}
		return undefined
	})

	function getOpenPanelItems() {
		const persistedOpenPanelItems = browser ? localStorage.getItem('openPanelItems') : undefined
		if (!persistedOpenPanelItems) return {}
		const openPanelItems: Record<string, string[]> = JSON.parse(persistedOpenPanelItems)
		return openPanelItems
	}

	let isOpen = $state(forceOpen)

	const openPanelItems = getOpenPanelItems()
	isOpen = nodeType ? openPanelItems[nodeType]?.includes(title) || forceOpen : forceOpen

	function toggleOpenPanelItem() {
		isOpen = !isOpen

		if (!nodeType) return

		const savedPanelItems = clone(getOpenPanelItems())
		let currentPanelItem = nodeType in savedPanelItems ? savedPanelItems[nodeType] : []

		const newPanelItem = isOpen
			? [...currentPanelItem, title]
			: currentPanelItem.filter(item => item !== title)

		const newPanelItems = {
			...savedPanelItems,
			[nodeType]: newPanelItem
		}

		localStorage.setItem('openPanelItems', JSON.stringify(newPanelItems))
	}

	const panelId = $derived.by(() => {
		if (selected.node) {
			return selected.node.id
		}

		const currentFlowId = getCurrentFlowId()
		if (currentFlowId) {
			return currentFlowId
		}

		return undefined
	})
</script>

<div class="grid py-2 ps-2 pe-8">
	{#if panelId}
		<button
			type="button"
			onclick={() => toggleOpenPanelItem()}
			class="me-auto flex items-center gap-1"
		>
			<IconChevronRight class={['transition-transform', isOpen ? 'rotate-90' : '']} />
			<h2 class="eyebrow inline-flex">{title}</h2>
		</button>
	{/if}

	<div
		class={[
			'overflow-y-hidden ps-6 transition-all duration-300',
			isOpen ? 'max-h-max pt-4 ease-out' : 'h-0 overflow-hidden ease-in'
		]}
	>
		<div class="pb-6">
			{@render children()}
		</div>
	</div>
</div>
