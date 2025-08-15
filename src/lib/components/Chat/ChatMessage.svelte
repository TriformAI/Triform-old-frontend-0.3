<script lang="ts">
	import { type MessageData } from './chatStore.svelte'

	interface Props {
		item: MessageData
	}

	const { item }: Props = $props()
</script>

<p
	class={[
		'relative',
		item.role === 'user' &&
			'text-main-200 bg-main-800 border-main-700 ms-auto max-w-3/4 rounded border p-4',
		item.role === 'assistant' && 'text-main-400 mb-2'
	]}
>
	{item.content}
</p>
