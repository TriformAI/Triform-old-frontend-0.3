<script lang="ts">
	import { onMount, tick } from 'svelte'
	import ChatItem from './ChatItem.svelte'
	import { handleMessage, parseHistory, chat } from './chatStore.svelte'
	import Button from '../atoms/Button.svelte'
	import { page } from '$app/state'
	import { getMessages } from '$lib/remote/chat.remote'
	import { WebSocket } from 'partysocket'
	import { throttle } from '$lib/utils/throttle'
	import ChatMention from './ChatMention.svelte'
	import { type Item } from './ChatMention.svelte'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import { userMessageModel } from '$lib/schemas/chat'
	import { z } from 'zod'

	type UserMessage = Omit<z.infer<typeof userMessageModel>, 'id' | 'runId' | 'sourceId' | 'stepId'>

	let chatMessagesContainer = $state<HTMLElement>()

	function scrollToBottom() {
		if (chatMessagesContainer) {
			chatMessagesContainer.scrollTo({
				top: chatMessagesContainer.scrollHeight,
				behavior: 'smooth'
			})
		}
	}

	// Scroll to bottom when new messages are added
	$effect(() => {
		if (chat.data.length > 0) {
			setTimeout(scrollToBottom, 100)
		}
	})

	let startId = $state<string>()

	async function loadHistory() {
		const messages = await getMessages(page.params.id!)

		startId = messages.length > 0 ? messages[messages.length - 1].id : undefined

		parseHistory(messages)
	}

	let socket = $state<WebSocket>()

	function initWebsocket() {
		socket = new WebSocket(`/api/projects/${page.params.id}/chat?startId=${startId}`)

		socket.onopen = () => {
			console.log('WebSocket connected')
		}

		socket.onmessage = async e => {
			try {
				handleMessage(JSON.parse(e.data))
				throttle(scrollToBottom, 300)
			} catch (error) {}
		}

		socket.onclose = () => {
			console.log('Socket closed')
		}

		socket.onerror = err => {
			console.error('Socket error', err)
		}
	}

	onMount(() => {
		chat.data = []
		;(async () => {
			await loadHistory()

			// Scroll to bottom after loading messages
			await tick()
			setTimeout(scrollToBottom, 100)

			initWebsocket()

			return () => {
				try {
					socket?.close()
				} catch (err) {
					console.error('error closing socket', err)
				}
			}
		})()
	})

	// Factory func for default state of userMessage
	function getUserMessage(): UserMessage {
		return {
			event: 'user_message',
			data: {
				content: [
					{
						type: 'text',
						text: ''
					}
				],
				context: {}
			}
		}
	}

	let userMessage = $state<UserMessage>(getUserMessage())

	function resetUserMessage() {
		userMessage = getUserMessage()
	}

	// Check that added context actually exists in the message
	// If not - remove it
	function sanitizeMessage() {
		const contextKeys = Object.keys(userMessage.data.context)

		for (const key of contextKeys) {
			if (!userMessage.data.content[0].text.includes(`${key}`)) {
				delete userMessage.data.context[key]
			}
		}
	}

	function sendMessage(event: Event) {
		if (userMessage.data.content[0].text.trim().length === 0) {
			return
		}

		sanitizeMessage()

		event.preventDefault()

		if (!socket) return

		//socket.send(JSON.stringify(userMessage))

		resetUserMessage()
	}

	let textarea = $state<HTMLTextAreaElement>()
	let showContextOptions = $state(false)
	let caretPos = $state(0)

	// Callback function for ChatMention
	async function insertMention(item: Item) {
		const fullNode = getCurrentContainer().spec.nodes[item.id]

		// Add selected node to context
		userMessage.data.context = {
			...userMessage.data.context,
			[`@${item.name}`]: {
				content: fullNode
			}
		}

		// Add mention to text
		userMessage.data.content[0].text = userMessage.data.content[0].text + item.name

		await tick()

		// Move cursor to end of mention
		if (textarea) {
			textarea.focus()
			const newCaretPos = item.name.length + caretPos + 1
			textarea.selectionStart = newCaretPos
			textarea.selectionEnd = newCaretPos
		}
	}

	// Options for ChatMention
	const nodeList = $derived.by(() => {
		return Object.entries(getCurrentContainer().spec.nodes).map(([id, node]) => ({
			id,
			name: node.spec.meta.name,
			resource: node.spec.resource
		}))
	})
</script>

<div
	class="bg-main-950/60 custom-scrollbar scroll-gutter-stable border-main-800 row-span-3 grid grid-rows-[1fr_auto] rounded-lg border"
>
	<!-- <pre class="text-xs">
{JSON.stringify(userMessage, null, 2)}
</pre> -->
	<div class="overflow-y-auto p-4" bind:this={chatMessagesContainer}>
		<ul class="chat grid gap-4 pb-6 text-sm">
			{#each chat.data as item}
				<li
					class="origin-top-right scale-100 opacity-100 transition-all duration-200 ease-(--easing-circ) starting:scale-90 starting:opacity-0"
				>
					<ChatItem {item} />
				</li>
			{/each}
		</ul>
	</div>

	<div class="px-4 pb-4 leading-none">
		<form onsubmit={sendMessage} class="input-text relative grid grid-rows-[1fr_auto] gap-2">
			<div class="absolute inset-x-0 bottom-[calc(100%+0.25rem)]">
				<ChatMention
					items={nodeList}
					onSelected={item => {
						insertMention(item)
					}}
					bind:isOpen={showContextOptions}
				/>
			</div>

			<textarea
				bind:this={textarea}
				onkeyup={(e: Event) => {
					caretPos = (e.target as HTMLTextAreaElement).selectionStart
				}}
				onkeydown={e => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
						e.preventDefault()
						sendMessage(e)
						return
					}

					if (e.key === '@') {
						showContextOptions = true
					}
				}}
				bind:value={userMessage.data.content[0].text}
				class="field-sizing-content max-h-30 w-full resize-none pb-2 outline-0"
				placeholder="Talk to your project"
			></textarea>

			<Button variation="vibrant" type="submit" class="ms-auto -me-2 -mb-1 px-2 py-1 text-sm">
				<div class="flex items-center gap-0.5">
					Send
					<kbd class="ms-2">⌘</kbd>
					<kbd>↵</kbd>
				</div>
			</Button>
		</form>
	</div>
</div>
