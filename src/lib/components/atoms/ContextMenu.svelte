<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import type { Snippet } from 'svelte'

	interface Props {
		open: boolean
		trigger: Snippet
		content: Snippet
	}

	let { open = $bindable(), trigger, content }: Props = $props()
</script>

<ContextMenu.Root bind:open>
	<ContextMenu.Trigger>
		{@render trigger()}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content>
			{@render content()}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
