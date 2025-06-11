<script lang="ts">
	import type { Snippet } from 'svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import { openPanelItems, toggleOpenPanelItem, selected } from '$lib/stores/panel.svelte'
	import { getCurrentFlowId } from '$lib/stores/canvas.svelte'
	import type { Component } from '$lib/types/agent'
	import IconAdd from '~icons/mdi/plus-circle-outline'

	export interface Props {
		componentData: Component
		title: string
		children: Snippet
		isDirty?: boolean
		forceOpen?: boolean
		isListContainer?: boolean
		onAddClick?: () => void
	}

	let {
		componentData,
		title,
		children,
		isDirty = false,
		forceOpen = false,
		isListContainer = false,
		onAddClick
	}: Props = $props()

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

	const isOpen = $derived(nodeType ? openPanelItems[nodeType]?.includes(title) : forceOpen)
</script>

<div class="grid py-2 ps-2 pe-8">
	<div class="flex flex-row items-center">
		{#if selected.node || getCurrentFlowId()}
			<button
				type="button"
				onclick={() => toggleOpenPanelItem(nodeType!, title)}
				class={['me-auto flex w-full items-center gap-1']}
			>
				<IconChevronRight class={[' transition-transform', isOpen ? 'rotate-90' : '']} />
				<h2 class={['eyebrow text-main-300 whitespace-nowrap transition-colors']}>
					{title}
				</h2>
				<div
					class={[
						'bg-warning-600 size-1.5 -translate-y-0.5 rounded-full transition-all',
						isDirty ? 'scale-100' : 'scale-0'
					]}
					aria-label="Unsaved changes"
					data-balloon-pos="right"
				></div>
			</button>
			{#if isListContainer}
				<button
					type="button"
					onclick={onAddClick}
					class="text-main-400 hover:text-main-200 cursor-pointer transition"
				>
					<IconAdd class="size-5" />
				</button>
			{/if}
		{/if}
	</div>

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
