<script lang="ts">
	import IconRevert from '~icons/mdi/replay'
	import { type ParsedItem } from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatRun from './ChatRun.svelte'
	import type { MessageData } from '$lib/stores/chat.svelte'

	interface Props {
		item: ParsedItem
		useCanvasContext?: boolean
		onRevert?: (item: MessageData) => void | Promise<void>
	}

	const { item, useCanvasContext = false, onRevert }: Props = $props()
</script>

<li class="grid opacity-100 transition-all duration-400 starting:translate-y-4 starting:opacity-0">
	{#if item.type === 'message'}
		<ChatMessage {item} {useCanvasContext} {onRevert} />
	{:else if item.type === 'run'}
		<ChatRun {item} />
	{/if}
</li>
