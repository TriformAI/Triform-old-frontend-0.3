<script lang="ts">
	import { ContextMenu } from 'bits-ui'
	import type { Snippet } from 'svelte'

	interface Props {
		open: boolean
		trigger: Snippet
		content: Snippet
		triggerClass?: string
	}

	let { open = $bindable(), trigger, content, triggerClass }: Props = $props()
</script>

<ContextMenu.Root bind:open>
	<ContextMenu.Trigger class={triggerClass}>
		{@render trigger()}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content>
			{@render content()}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
