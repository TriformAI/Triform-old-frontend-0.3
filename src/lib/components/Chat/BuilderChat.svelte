<script lang="ts">
	import { onMount, tick } from 'svelte'
	import {
		chat,
		getUserMessage,
		type ParsedItem,
		initChat,
		unregisterChatContainer,
		type ChatUrlBuilder,
		type MessageData,
		resetChatState,
		parseHistory
	} from '$lib/stores/chat.svelte'
	import ChatMessages from './ChatMessages.svelte'
	import ChatInput, { type Highlight, type ContextChip } from './ChatInput.svelte'
	import {
		getCurrentContainer,
		getNodePath,
		getNodeByPath,
		setProject,
		refreshFlow
	} from '$lib/stores/canvas.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { arraysDiffer } from '$lib/utils/arraysDiffer'
	import { userMessageModel } from '$lib/schemas/chat'
	import type * as z from 'zod'
	import { toast } from 'svelte-sonner'
	import type { Item } from './ChatMention.svelte'
	import {
		getMessages as getProjectMessages,
		cancelChat as cancelProjectChat
	} from '$lib/actions/builderChat'
	import { page } from '$app/state'
	import { objFilter } from '$lib/utils/objectFilter'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { revert } from '$lib/actions/builderChat'

	let {
		onMessage
	}: {
		onMessage?: () => void
	} = $props()

	const id = $derived(page.params.id)

	const buildWsUrl: ChatUrlBuilder = ({ id, startId }) => {
		if (!id) return '/api/projects/unknown/chat'
		const qs = startId ? `?startId=${encodeURIComponent(startId)}` : ''
		return `/api/projects/${id}/chat${qs}`
	}

	const getMessages = async (maybeId?: string) => {
		if (!maybeId) return []
		const res: any = await getProjectMessages(maybeId)
		return Array.isArray(res?.data) ? res.data : []
	}

	const cancel = async (maybeId?: string) => {
		if (!maybeId) return false
		return await cancelProjectChat(maybeId)
	}

	let chatMessagesContainer = $state<HTMLElement>()
	let message = $state('')
	let context = $state<z.infer<typeof userMessageModel>['data']['context']>({})
	let textarea = $state<HTMLTextAreaElement>()
	let mentionMenuOpen = $state(false)
	let forceUpdateCharPos = $state(false)

	const caretPos = $derived.by(() => {
		const _ref = forceUpdateCharPos
		return textarea?.selectionStart ?? 0
	})
	const previousChar = $derived(caretPos > 0 ? message.at(Math.max(0, caretPos - 1)) : '')

	const selectedNodePaths = $derived.by(() => Object.values(context).map(c => c.node_path))
	const nodeList = $derived.by<Item[]>(() => {
		const container = getCurrentContainer()
		const basePath = (getNodePath()?.split('/') ?? []).filter(Boolean)
		return Object.entries(container.spec.nodes ?? {})
			.map(([nodeId, node]) => ({
				id: nodeId,
				name: node.spec.meta.name,
				resource: node.spec.resource
			}))
			.filter(n => selectedNodePaths.every(sp => arraysDiffer([...basePath, n.id], sp ?? [])))
	})

	const contextChips = $derived.by<ContextChip[]>(() => {
		return Object.entries(context).map(([key, value]) => {
			const node = getNodeByPath(value.node_path ?? [])
			const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
			return {
				key,
				label: key.split('@').slice(1).join('@'),
				icon: nodeTypeData?.icon,
				iconClass: Array.isArray(nodeTypeData?.iconClasses)
					? nodeTypeData?.iconClasses.join(' ')
					: (nodeTypeData?.iconClasses ?? '')
			}
		})
	})

	const highlights = $derived.by<Highlight[]>(() => {
		return Object.entries(context).map(([key, value]) => {
			const node = getNodeByPath(value.node_path ?? [])
			const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
			return {
				text: key,
				fill: `color-mix(in oklab, color-mix(in oklab, ${nodeTypeData?.iconColor} 90%, black) 15%, transparent)`,
				border: 'transparent'
			}
		})
	})

	const isWaitingForAssistant = $derived.by(() => {
		if (chat.data.length === 0) return false
		const runs = chat.data.filter(item => item.type === 'run')
		if (!runs.length) return false
		const latestRun = runs.at(-1)
		return !latestRun?.completed
	})

	onMount(() => {
		;(async () => {
			await tick()
			if (!chatMessagesContainer) {
				console.log('chatMessagesContainer not bound')
				return
			}

			await initChat(id, chatMessagesContainer, onMessage, getMessages, buildWsUrl)

			if (page.state.initPrompt) {
				message = page.state.initPrompt + ''
				sendMessage()
				page.state.initPrompt = undefined
			}
		})()

		return () => {
			if (chatMessagesContainer) {
				unregisterChatContainer(chatMessagesContainer, onMessage)
			}
		}
	})

	function resetUserMessage() {
		message = ''
		context = {}
	}

	function sendMessage() {
		if (!message.trim().length) return
		if (!chat.socket) return

		const userMessage = getUserMessage()
		userMessage.data.context = {
			...context,
			[`~currentContainer`]: {
				container: {
					type: getCurrentContainer().resource === 'project/v1' ? 'project' : 'component',
					id: getCurrentContainer().id!
				}
			}
		}
		userMessage.data.content[0].text = message

		chat.socket.send(JSON.stringify(userMessage))

		resetUserMessage()
		mentionMenuOpen = false
	}

	const cancelRunningChat = async () => {
		const res = await cancel(id)
		if (!res) toast.error('Failed to cancel chat')
	}

	const insertAtCaret = async (el: HTMLTextAreaElement, snippet: string) => {
		el.focus()
		await tick()
		el.setRangeText(snippet, el.selectionStart, el.selectionEnd, 'end')
		el.dispatchEvent(new Event('input', { bubbles: true }))
	}

	const addToContext = async (nodeId: string) => {
		if (!textarea) return

		const fullNode = getCurrentContainer().spec.nodes[nodeId]
		if (!fullNode) return
		const name = fullNode.spec.meta.name

		context[`@${name}`] = {
			component_id: fullNode.component_id,
			node_path: [...(getNodePath()?.split('/') ?? []), nodeId].filter(Boolean)
		}

		const mention = `${previousChar === '@' ? '' : '@'}${name} `
		forceUpdateCharPos = !forceUpdateCharPos
		await insertAtCaret(textarea, mention)
		message = textarea.value
		mentionMenuOpen = false

		await tick()
	}

	const removeFromContext = (key: string) => {
		delete context[key]
		message = message.replace(new RegExp(`${key}\s?`, 'g'), '').trim()
		forceUpdateCharPos = !forceUpdateCharPos
	}

	const handleMentionClose = () => {
		mentionMenuOpen = false
		if (!textarea) return
		textarea.selectionStart = caretPos
		textarea.selectionEnd = caretPos
		textarea.focus()
	}

	const handleTextareaKeydown = (e: KeyboardEvent) => {
		setTimeout(() => {
			forceUpdateCharPos = !forceUpdateCharPos
			if (textarea) {
				const pos = textarea.selectionStart ?? 0
				const charBefore = textarea.value.at(Math.max(0, pos - 1))
				if (charBefore === '@') mentionMenuOpen = true
			}
		}, 1)

		if (e.key === 'Enter') {
			if (!e.shiftKey) {
				e.preventDefault()
				sendMessage()
				return
			}
		} else if (e.key === 'Backspace') {
			const cursorPos = textarea?.selectionStart ?? 0
			if (cursorPos > 0) {
				const textBeforeCursor = message.substring(0, cursorPos)
				const atIndex = textBeforeCursor.lastIndexOf('@')
				if (atIndex === -1) return
				const potentialMention = textBeforeCursor.substring(atIndex)
				if (context[potentialMention] && cursorPos === atIndex + potentialMention.length) {
					e.preventDefault()
					removeFromContext(potentialMention)
				}
			}
		}
	}

	const handleTextareaInput = () => {
		for (const key of Object.keys(context)) if (!message.includes(key)) removeFromContext(key)
		if (!message.includes('@')) mentionMenuOpen = false
	}

	const handleTextareaMousedown = () => {
		setTimeout(() => (forceUpdateCharPos = !forceUpdateCharPos), 1)
	}

	const handleRevert = async (item: MessageData) => {
		if (!page.params.id || !item.snapshot) return
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message:
				'This will revert the entire project (including your own changes) to the state it was in when this message was sent.<br><br><b>This cannot currently be undone.</b>'
		})
		if (!confirmed) return
		console.log('restoring', item.snapshot)
		const res = await revert(page.params.id, item.snapshot)
		if (!res.success) return void toast.error('Error reverting to message')
		const { project, uiMessages } = res.data
		console.log('project', project)
		console.log('uiMessages', uiMessages)
		setProject(project)
		refreshFlow()
		resetChatState()
		parseHistory(uiMessages)
		message = item.content
		context = objFilter(item.context ?? {}, key => key.startsWith('@'))
		forceUpdateCharPos = !forceUpdateCharPos
		if (textarea) {
			textarea.focus()
			textarea.selectionStart = message.length
			textarea.selectionEnd = message.length
		}
	}
</script>

<div
	class="bg-main-950/60 custom-scrollbar scroll-gutter-stable border-main-800 row-span-3 grid h-full grid-rows-[1fr_auto] rounded-lg border"
>
	<ChatMessages
		bind:container={chatMessagesContainer}
		items={chat.data as ParsedItem[]}
		{isWaitingForAssistant}
		useCanvasContext={true}
		onRevert={handleRevert}
	/>

	<div class="px-4 pb-4 leading-none">
		<ChatInput
			bind:message
			bind:textarea
			enableContextMentions={true}
			bind:isOpen={mentionMenuOpen}
			{nodeList}
			{contextChips}
			{highlights}
			{isWaitingForAssistant}
			onMentionSelected={addToContext}
			onMentionClose={handleMentionClose}
			onRemoveContext={removeFromContext}
			onTextareaKeydown={handleTextareaKeydown}
			onTextareaInput={handleTextareaInput}
			onTextareaMousedown={handleTextareaMousedown}
			onSubmit={sendMessage}
			onCancel={cancelRunningChat}
		/>
	</div>
</div>
