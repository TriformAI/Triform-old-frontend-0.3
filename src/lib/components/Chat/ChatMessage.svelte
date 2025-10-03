<script lang="ts">
	import { type MessageData } from '$lib/stores/chat.svelte'
	import { marked } from 'marked'
	import HighlightableSpan from '../atoms/HighlightableSpan.svelte'
	import { getNodeByPath, getProject, getProjectNodes } from '$lib/stores/canvas.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'

	interface Props {
		item: MessageData
	}

	const { item }: Props = $props()

	const highlights = $derived.by(() => {
		if (item.role === 'user')
			return Object.entries(item.context ?? {}).map(([key, value]) => {
				const node = getNodeByPath(value.node_path ?? [])
				const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
				return {
					text: key,
					fill: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, black)`,
					color: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, white)`
				}
			})

		const res = []
		const nodes = getProjectNodes()
		const project = getProject()
		for (const node of nodes) {
			// console.log(
			// 	'checking',
			// 	node.node.spec.meta.name,
			// 	item.content.includes(`@${node.node.spec.meta.name}`)
			// )
			if (!item.content.includes(`@${node.node.spec.meta.name}`)) continue
			const nodeTypeData = nodeTypesDict[node.node.spec.resource.split('/')[0] as NodeType]
			if (!nodeTypeData) continue
			const nodePath =
				node.node.spec.resource.split('/')[0] === 'action' ? node.path.slice(0, -1) : node.path
			res.push({
				text: `@${node.node.spec.meta.name}`,
				fill: `color-mix(in oklab, ${nodeTypeData.color ?? 'var(--color-main-300)'} 40%, black)`,
				color: `color-mix(in oklab, ${nodeTypeData.color ?? 'var(--color-main-300)'} 40%, white)`,
				link: `/project/${project.id}/${nodePath.join('/') ?? ''}`
			})
		}
		return res
	})
</script>

<div
	class={[
		'bubble',
		'whitespace-pre-wrap', // preserve user newlines
		'wrap-anywhere', // break long words/urls
		'word-break-[break-word]', // fallback
		'*:whitespace-pre-wrap', // For code blocks
		'relative inline-grid max-w-4/5 gap-2',
		item.role === 'user' &&
			'text-main-200 bg-main-800 border-main-700 ms-auto w-fit rounded border p-3',
		item.role === 'assistant' && 'text-main-300/90 mb-2'
	]}
>
	<HighlightableSpan text={item.content} {highlights} markdown={true} />
</div>
