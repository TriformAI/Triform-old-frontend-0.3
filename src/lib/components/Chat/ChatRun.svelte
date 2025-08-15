<script lang="ts">
	import { type RunData } from './chatStore.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'

	interface Props {
		item: RunData
	}

	const { item }: Props = $props()
</script>

<ul class="grid gap-2">
	{#each item.children as child}
		<li>
			{#if child.type === 'message'}
				<ChatMessage item={child} />
			{:else if child.type === 'step_event'}
				<ChatStep item={child} />
			{/if}
		</li>
	{/each}
</ul>
