<script lang="ts">
	import { type MessageData } from '$lib/stores/chat.svelte'
	import { marked } from 'marked'
	import HighlightableSpan from '../atoms/HighlightableSpan.svelte'
	import { getNodeByPath } from '$lib/stores/canvas.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'

	interface Props {
		item: MessageData
	}

	const { item }: Props = $props()

	const highlights = $derived(
		Object.entries(item.context ?? {}).map(([key, value]) => {
			const node = getNodeByPath(value.node_path ?? [])
			const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
			return {
				text: key,
				fill: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, black)`,
				color: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, white)`
			}
		})
	)
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
	<HighlightableSpan text={item.content} {highlights} markdown={true} />
</div>
