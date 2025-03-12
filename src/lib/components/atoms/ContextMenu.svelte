<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import type { Snippet } from 'svelte'

	interface Props {
		open: boolean
		trigger: Snippet
		menu: Snippet
	}

	let { open = $bindable(), trigger, menu }: Props = $props()
</script>

<ContextMenu.Root bind:open>
	<ContextMenu.Trigger>
		{@render trigger()}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content>
			{@render menu()}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
