<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getCurrentContainer, getVisibleComponent } from '$lib/stores/canvas.svelte'
	import IconAdd from '~icons/mdi/plus-circle-outline'

	export interface Props {
		nodeId: string
		title: string
		children: Snippet
		isDirty?: boolean
		forceOpen?: boolean
		isListContainer?: boolean
		onAddClick?: () => void
	}

	let {
		nodeId,
		title,
		children,
		isDirty = false,
		forceOpen = false,
		isListContainer = false,
		onAddClick
	}: Props = $props()

	const componentData = $derived(getVisibleComponent(nodeId))

	const nodeType = $derived.by(() => {
		if (!componentData) return

		if (componentData.resource === 'flow/v1') {
			return 'flow'
		}
		if (componentData.resource === 'action/v1') {
			return 'action'
		}
		return undefined
	})
</script>

<div class={[' grid  p-5 pt-4']}>
	{#if /*selected.node ||*/ getCurrentContainer()}
		<div class="mb-4 flex flex-row items-center">
			<h2 class={['eyebrow text-main-300 whitespace-nowrap transition-colors']}>
				{title}
			</h2>

			<div
				class={[
					'bg-warning-600 ms-1 size-1.5 -translate-y-0.5 rounded-full transition-all',
					isDirty ? 'scale-100' : 'scale-0'
				]}
				aria-label="Unsaved changes"
				data-balloon-pos="right"
			></div>

			{#if isListContainer}
				<button
					type="button"
					onclick={onAddClick}
					class="text-main-400 hover:text-main-200 cursor-pointer transition"
				>
					<IconAdd class="size-5" />
				</button>
			{/if}
		</div>
	{/if}

	<div class={['overflow-y-hidden']}>
		<div class="pb-6">
			{@render children()}
		</div>
	</div>
</div>
