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
		chevronClass,
		contentClass,
		disableAnimation = false,
		// whether to set everything as contents so the layout is "transparent"
		transparentLayout = false
	}: {
		open?: boolean
		trigger?: Snippet
		children?: Snippet
		class?: string[]
		triggerClass?: string[]
		showChevron?: boolean
		chevronClass?: string
		contentClass?: string
		disableAnimation?: boolean
		transparentLayout?: boolean
	} = $props()

	const conditionalTransition = (...args: Parameters<typeof slide>): TransitionConfig => {
		if (disableAnimation) return
		return slide(...args)
	}
</script>

<Collapsible.Root bind:open class={[transparentLayout && 'contents']}>
	<Collapsible.Trigger
		class={[
			...(triggerClass ?? []),
			'group/trigger',
			open && 'open',
			transparentLayout && 'contents'
		]}
	>
		<div class={['items-center gap-1.5', transparentLayout ? 'contents' : 'flex']}>
			{@render trigger?.()}
			{#if showChevron}
				<IconChevronDown
					class={chevronClass ??
						[
							'group-hover/trigger:text-main-300 group-open:text-main-400 inline size-4 shrink-0 transition-all duration-200',
							open ? 'text-main-300 rotate-0' : 'text-main-600 -rotate-90'
						].join(' ')}
				/>
			{/if}
		</div>
	</Collapsible.Trigger>
	<Collapsible.Content forceMount class={[contentClass]}>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:conditionalTransition={{ axis: 'y' }}>
					{@render children?.()}
				</div>
			{/if}
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
