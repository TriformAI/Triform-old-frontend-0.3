<script lang="ts">
	import { resetChatState, parseHistory, type MessageData } from '$lib/stores/chat.svelte'
	import { marked } from 'marked'
	import HighlightableSpan from '../atoms/HighlightableSpan.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { onMount } from 'svelte'
	import IconRevert from '~icons/material-symbols/undo-rounded'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from '../atoms/Button.svelte'
	import { revert } from '$lib/actions/builderChat'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { resolvedProjectModel } from '$lib/schemas'

	const {
		item,
		useCanvasContext = false,
		onRevert
	}: {
		item: MessageData
		useCanvasContext?: boolean
		onRevert?: (item: MessageData) => void | Promise<void>
	} = $props()

	let getNodeByPathFn: (path: string[]) => any = () => undefined
	let getProjectNodesFn: () => Iterable<any> = () => []
	let getProjectFn: () => { id?: string } = () => ({ id: undefined })

	onMount(async () => {
		if (!useCanvasContext) return
		try {
			const mod = await import('$lib/stores/canvas.svelte')
			getNodeByPathFn = mod.getNodeByPath
			getProjectNodesFn = mod.getProjectNodes
			getProjectFn = mod.getProject
		} catch (e) {
			// ignore: running outside canvas context
		}
	})

	const highlights = $derived.by(() => {
		if (!useCanvasContext) return []
		if (item.role === 'user')
			return Object.entries(item.context ?? {}).map(([key, value]) => {
				const node = getNodeByPathFn(value.node_path ?? [])
				const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
				return {
					text: key,
					fill: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, black)`,
					color: `color-mix(in oklab, ${nodeTypeData?.color ?? 'var(--color-main-300)'} 40%, white)`
				}
			})

		const res = []
		const nodes = Array.from(getProjectNodesFn() ?? [])
		const project = getProjectFn()
		for (const node of nodes) {
			// console.log(
			// 	'checking',
			// 	node.node.spec.meta.name,
			// 	item.content.includes(`@${node.node.spec.meta.name}`)
			// )
			const nodeSpec = node?.node?.spec
			if (!nodeSpec) continue
			if (!item.content.includes(`@${nodeSpec.meta.name}`)) continue
			const nodeType = nodeSpec.resource.split('/')[0] as NodeType
			const nodeTypeData = nodeTypesDict[nodeType]
			if (!nodeTypeData) continue
			const nodePath = nodeType === 'action' ? node.path.slice(0, -1) : node.path
			res.push({
				text: `@${nodeSpec.meta.name}`,
				fill: `color-mix(in oklab, ${nodeTypeData.color ?? 'var(--color-main-300)'} 40%, black)`,
				color: `color-mix(in oklab, ${nodeTypeData.color ?? 'var(--color-main-300)'} 40%, white)`,
				link: project?.id ? `/project/${project.id}/${nodePath.join('/') ?? ''}` : undefined
			})
		}
		return res
	})
</script>

<div
	class={[
		'bubble max-w-4/5',
		'flex flex-row gap-1',
		'group/message',
		item.role === 'user' &&
			'text-main-200 bg-main-800 border-main-700 ms-auto w-fit rounded border p-3',
		item.role === 'assistant' && 'text-main-300/90 mb-2'
	]}
>
	<div
		class={[
			'whitespace-pre-wrap', // preserve user newlines
			'wrap-anywhere', // break long words/urls
			'word-break-[break-word]', // fallback
			'*:whitespace-pre-wrap', // For code blocks
			'relative inline-grid gap-2'
		]}
	>
		<HighlightableSpan text={item.content} {highlights} markdown={true} />
	</div>
	{#if item.role === 'user' && item.snapshot}
		<Button
			class={[
				'text-main-500 icon-btn -mr-2 -mb-1.5 self-end',
				'hover:text-main-200 group-hover/message:text-main-400'
			]}
			onClick={async () => await onRevert?.(item)}
			variation="link"
			autoLoad="promise"
		>
			{#snippet icon()}
				<IconRevert class="size-4" />
			{/snippet}
		</Button>
	{/if}
</div>
