<script lang="ts">
	import { type RunData, type WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'
	import ChatWidget from './ChatWidget.svelte'
	import ChatAction from './ChatAction.svelte'

	const {
		item,
		onWidgetComplete
	}: {
		item: RunData
		onWidgetComplete: WidgetCompleteCallback
	} = $props()
</script>

<ul class="grid gap-2">
	{#each item.children as child}
		<li>
			{#if child.type === 'message'}
				<ChatMessage item={child} />
			{:else if child.type === 'step'}
				<ChatStep item={child} {onWidgetComplete} />
			{:else if child.type === 'widget'}
				<ChatWidget item={child} onComplete={onWidgetComplete} />
			{/if}
		</li>
	{/each}
	<div class="flex flex-row flex-wrap gap-4">
		{#each item.actions as action}
			<ChatAction {action} run={item} />
		{/each}
	</div>
</ul>
