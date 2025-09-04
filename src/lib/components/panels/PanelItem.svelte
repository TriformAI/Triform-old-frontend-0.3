<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getCurrentContainer, getVisibleComponent } from '$lib/stores/canvas.svelte'
	import IconAdd from '~icons/mdi/plus-circle-outline'

	export interface Props {
		nodeId: string
		title: string
		children: Snippet
		titleSuffix?: Snippet
		forceOpen?: boolean
		isListContainer?: boolean
		onAddClick?: () => void
		fillHeight?: boolean
	}

	let {
		nodeId,
		title,
		children,
		forceOpen = false,
		isListContainer = false,
		onAddClick,
		titleSuffix,
		fillHeight = true
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

<div class={['grid grid-rows-[auto_1fr] p-5 pt-4', fillHeight && 'h-full']}>
	{#if getCurrentContainer()}
		<div class="mb-4 flex flex-row items-center gap-2">
			<h2 class={['eyebrow text-main-300 whitespace-nowrap transition-colors']}>
				{title}
			</h2>

			{#if isListContainer}
				<button
					type="button"
					onclick={onAddClick}
					class="text-main-400 hover:text-main-200 cursor-pointer transition"
				>
					<IconAdd class="size-5" />
				</button>
			{/if}

			{#if titleSuffix}
				{@render titleSuffix()}
			{/if}
		</div>
	{/if}

	<div class="grid overflow-y-hidden">
		{@render children()}
	</div>
</div>
