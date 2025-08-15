<script lang="ts">
	import IconRevert from '~icons/mdi/replay'
	import { type ParsedItem } from './chatStore.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatRun from './ChatRun.svelte'

	interface Props {
		item: ParsedItem
	}

	const { item }: Props = $props()
</script>

{#if item.type === 'message'}
	<ChatMessage {item} />
{:else if item.type === 'run'}
	<ChatRun {item} />
{/if}
