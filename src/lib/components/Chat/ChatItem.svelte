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

<li
	class="grid origin-top-right scale-100 opacity-100 transition-all duration-200 ease-(--easing-circ) starting:scale-90 starting:opacity-0"
>
	{#if item.type === 'message'}
		<ChatMessage {item} />
	{:else if item.type === 'run'}
		<ChatRun {item} />
	{/if}
</li>
