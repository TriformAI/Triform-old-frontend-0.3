<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { beforeNavigate, goto } from '$app/navigation'
	import { page } from '$app/state'
	import {
		chat,
		getUserMessage,
		type ParsedItem,
		initChat,
		unregisterChatContainer,
		type ChatUrlBuilder
	} from '$lib/stores/chat.svelte'
	import ChatInput from '$lib/components/Chat/ChatInput.svelte'
	import ChatMessages from '$lib/components/Chat/ChatMessages.svelte'
	import { getMessages as getThreadMessages, createThread } from '$lib/actions/chat'
	import { cleanupChat } from '$lib/stores/chat.svelte'
	import type { PageProps } from './$types'
	import { chatTriggerUiMessageModel } from '$lib/schemas/chat'
	import type * as z from 'zod'
	import { selectedTools } from '$lib/stores/triggerChat.svelte'

	let { onMessage, data }: { onMessage?: () => void; data: PageProps['data'] } = $props()

	beforeNavigate(cleanupChat)
	onMount(() => cleanupChat)

	const id = $derived(page.params.id)

	const buildWsUrl: ChatUrlBuilder = ({ id, startId }) => {
		const qs = startId ? `?startId=${encodeURIComponent(startId)}` : ''
		return `/api/chat/threads/${id}/ws${qs}`
	}

	const getMessages = async (_id?: string) => {
		console.log('getMessages', data.messages)
		return data.messages.map(m => ({ id: m.id, ...m.data })) ?? []
	}

	const cancel = async () => {
		console.log('cancelling chat', chat.socket)
		chat.socket?.send(
			JSON.stringify(
				chatTriggerUiMessageModel.parse({
					event: 'cancel',
					data: {}
				})
			)
		)
	}

	let chatMessagesContainer = $state<HTMLElement>()
	let message = $state('')
	let textarea = $state<HTMLTextAreaElement>()

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
			if (!chatMessagesContainer) return
			await initChat(id, chatMessagesContainer, onMessage, getMessages, buildWsUrl)
			console.log('mounted chat', id, chat.socket)

			// After navigation with state, send initial message once socket is ready
			const initialMessage = page.state.initialMessage
			if (initialMessage && initialMessage.trim().length) {
				message = initialMessage
				await tick()
				sendMessage()
				page.state.initialMessage = undefined
			}
		})()

		return () => {
			if (chatMessagesContainer) unregisterChatContainer(chatMessagesContainer, onMessage)
		}
	})

	function resetUserMessage() {
		message = ''
	}

	function sendMessage() {
		if (!message.trim().length) return

		// If no thread id yet, create one and redirect with state carrying the message
		if (!id) {
			;(async () => {
				const res = await createThread(message)
				const newId = (res as any)?.data?.id as string | undefined
				if (!newId) return
				await goto(`/chat/${newId}`, { state: { initialMessage: message } })
			})()
			return
		}

		if (!chat.socket) return

		const userMessage = {
			event: 'user_message',
			data: {
				content: [
					{
						type: 'text',
						text: message
					}
				],
				tools: selectedTools.tools
			}
		} satisfies z.infer<typeof chatTriggerUiMessageModel>

		chat.socket.send(JSON.stringify(userMessage))

		resetUserMessage()
	}
</script>

<div class="flex h-full flex-col gap-2 pb-0.5">
	<ChatMessages
		bind:container={chatMessagesContainer}
		items={chat.data}
		{isWaitingForAssistant}
		useCanvasContext={false}
		class={['mr-1 rounded-md']}
	/>
	<ChatInput
		bind:message
		bind:textarea
		enableContextMentions={false}
		isOpen={false}
		nodeList={[]}
		contextChips={[]}
		highlights={[]}
		{isWaitingForAssistant}
		onSubmit={sendMessage}
		onCancel={cancel}
		onMentionSelected={() => {}}
		onMentionClose={() => {}}
		onRemoveContext={() => {}}
		onTextareaKeydown={e => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault()
				sendMessage()
			}
		}}
		onTextareaInput={() => {}}
		onTextareaMousedown={() => {}}
		placeholder="Ask me anything..."
	/>
</div>
