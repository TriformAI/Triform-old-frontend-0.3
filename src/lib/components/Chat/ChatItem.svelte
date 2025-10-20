<script lang="ts">
	import {
		type ParsedItem,
		type MessageData,
		type WidgetCompleteCallback
	} from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatRun from './ChatRun.svelte'

	const {
		item,
		useCanvasContext = false,
		onWidgetComplete,
		onRevert
	}: {
		item: ParsedItem
		useCanvasContext?: boolean
		onWidgetComplete?: WidgetCompleteCallback
		onRevert?: (item: MessageData) => void | Promise<void>
	} = $props()
</script>

<li class="grid opacity-100 transition-all duration-400 starting:translate-y-4 starting:opacity-0">
	{#if item.type === 'message'}
		<ChatMessage {item} {useCanvasContext} {onRevert} />
	{:else if item.type === 'run'}
		<ChatRun {item} {onWidgetComplete} />
	{/if}
</li>
