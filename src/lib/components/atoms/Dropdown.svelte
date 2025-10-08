<script lang="ts">
	import type { Snippet } from 'svelte'
	import { DropdownMenu } from 'bits-ui'
	import { slide } from 'svelte/transition'

	interface Props {
		trigger: Snippet
		children: Snippet
		class?: string
		contentClass?: string
		disabled?: boolean
		portal?: HTMLDivElement
	}

	let {
		trigger,
		children,
		class: classes,
		contentClass,
		disabled = false,
		portal
	}: Props = $props()
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={classes} {disabled}>
		{@render trigger()}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal to={portal}>
		<DropdownMenu.Content
			class={[
				'bg-main-900 border-main-800 custom-scrollbar z-50 max-h-80 w-42 overflow-y-auto rounded border py-1 transition-all',
				contentClass
			]}
			forceMount
		>
			{#snippet child({ wrapperProps, props, open })}
				{#if open}
					<div {...wrapperProps}>
						<div {...props} transition:slide={{ axis: 'y' }}>
							{@render children()}
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
