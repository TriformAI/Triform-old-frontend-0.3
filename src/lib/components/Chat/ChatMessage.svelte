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
		'relative grid max-w-4/5 gap-4',
		item.role === 'user' &&
			'text-main-200 bg-main-800 border-main-700 ms-auto w-fit rounded border p-3',
		item.role === 'assistant' && 'text-main-400 mb-2'
	]}
>
	{@html marked.parse(item.content)}
</div>
