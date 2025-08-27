<script lang="ts">
	import { type MessageData } from './chatStore.svelte'
	import { marked } from 'marked'

	interface Props {
		item: MessageData
	}

	const { item }: Props = $props()
</script>

<div
	class={[
		'bubble',
		'whitespace-pre-wrap', // preserve user newlines
		'wrap-anywhere', // break long words/urls
		'word-break-[break-word]', // fallback
		'*:whitespace-pre-wrap', // For code blocks
		'relative inline-grid max-w-4/5 gap-4',
		item.role === 'user' &&
			'text-main-200 bg-main-800 border-main-700 ms-auto w-fit rounded border p-3',
		item.role === 'assistant' && 'text-main-300/90 mb-2'
	]}
>
	{@html marked.parse(item.content)}
</div>
