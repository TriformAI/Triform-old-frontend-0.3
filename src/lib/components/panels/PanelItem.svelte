<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getCurrentContainer, getVisibleComponent } from '$lib/stores/canvas.svelte'
	import { Tooltip } from 'bits-ui'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import IconInfo from '~icons/material-symbols/info-outline-rounded'

	let {
		nodeId,
		title,
		children,
		forceOpen = false,
		isListContainer = false,
		onAddClick,
		titleSuffix,
		fillHeight = true,
		tip
	}: {
		nodeId: string
		title: string
		children: Snippet
		titleSuffix?: Snippet
		forceOpen?: boolean
		isListContainer?: boolean
		onAddClick?: () => void
		fillHeight?: boolean
		tip?: string
	} = $props()

	const componentData = $derived(getVisibleComponent(nodeId))

	const nodeType = $derived.by(() => {
		if (!componentData) return

		if (componentData.resource === 'flow/v1') return 'flow'
		if (componentData.resource === 'action/v1') return 'action'
		return undefined
	})
</script>

<div class={['grid grid-rows-[auto_1fr] p-5 pt-4 pr-0', fillHeight && 'h-full']}>
	{#if getCurrentContainer()}
		<div class="mb-4 flex flex-row items-center gap-2">
			<h2 class={['eyebrow text-main-300 whitespace-nowrap transition-colors']}>
				{title}
			</h2>

			{#if isListContainer}
				<button
					type="button"
					onclick={onAddClick}
					class="text-main-500 hover:text-main-200 icon-btn cursor-pointer transition"
				>
					<IconAdd class="size-5" />
				</button>
			{/if}

			{#if tip}
				<div
					data-balloon-instant="true"
					aria-label={tip}
					data-balloon-pos={isListContainer ? 'down-right' : 'down-left'}
					data-balloon-length="medium"
					class={[isListContainer && 'ml-auto']}
				>
					<IconInfo class="text-main-600 hover:text-main-400 size-5 !cursor-help transition" />
				</div>
			{/if}

			{#if titleSuffix}
				{@render titleSuffix()}
			{/if}
		</div>
	{/if}

	<div class="scroll-gutter-stable grid overflow-y-auto">
		{@render children()}
	</div>
</div>
