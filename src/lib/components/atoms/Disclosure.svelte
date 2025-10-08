<script lang="ts">
	import { Collapsible } from 'bits-ui'
	import { slide } from 'svelte/transition'
	import type { Snippet } from 'svelte'

	let open = $state(false)
	let {
		trigger,
		children,
		class: classes,
		triggerClass
	}: {
		trigger?: Snippet
		children?: Snippet
		class?: string[]
		triggerClass?: string[]
	} = $props()
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger class={triggerClass}>
		{@render trigger?.()}
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
