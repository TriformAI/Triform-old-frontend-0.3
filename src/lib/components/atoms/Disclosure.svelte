<script lang="ts">
	import { Collapsible } from 'bits-ui'
	import { slide } from 'svelte/transition'
	import type { Snippet } from 'svelte'
	import IconChevronDown from '~icons/mdi/chevron-down'

	let {
		open = $bindable(false),
		trigger,
		children,
		class: classes,
		triggerClass,
		showChevron = false,
		chevronClass
	}: {
		open?: boolean
		trigger?: Snippet
		children?: Snippet
		class?: string[]
		triggerClass?: string[]
		showChevron?: boolean
		chevronClass?: string
	} = $props()
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger class={[...(triggerClass ?? []), 'group/trigger', open && 'open']}>
		<div class="flex items-center gap-1.5">
			{@render trigger?.()}
			{#if showChevron}
				<IconChevronDown
					class={chevronClass ??
						[
							'text-main-600 group-hover/trigger:text-main-300 group-open:text-main-400 inline size-4 transition-all duration-200',
							open ? 'rotate-0' : '-rotate-90'
						].join(' ')}
				/>
			{/if}
		</div>
	</Collapsible.Trigger>
	<Collapsible.Content forceMount>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:slide={{ axis: 'y' }}>
					{@render children?.()}
				</div>
			{/if}
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
