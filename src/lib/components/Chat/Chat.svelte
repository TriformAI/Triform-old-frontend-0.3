<script lang="ts">
	import { onMount, tick } from 'svelte'
	import ChatItem from './ChatItem.svelte'
	import {
		parseHistory,
		chat,
		getUserMessage,
		type MessageData,
		type ParsedItem,
		type UserMessage,
		initWebsocket,
		scrollToBottom
	} from './chatStore.svelte'
	import Button from '../atoms/Button.svelte'
	import { page } from '$app/state'
	import { getMessages } from '$lib/remote/chat.remote'
	import ChatMention from './ChatMention.svelte'
	import { type Item } from './ChatMention.svelte'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'
	import LogoSpinner from '$lib/components/SpinnerLogo.svelte'

	let chatMessagesContainer = $state<HTMLElement>()

	// Scroll to bottom when new messages are added
	$effect(() => {
		if (chat.data.length > 0) {
			setTimeout(() => {
				if (chatMessagesContainer) {
					scrollToBottom(chatMessagesContainer)
				}
			}, 100)
		}
	})

	async function loadHistory() {
		chat.data = []

		const messages = await getMessages(page.params.id!)

		parseHistory(messages)
	}

	async function initChat(el: HTMLElement) {
		chatMessagesContainer = el
		initWebsocket(page.params.id!, el)
	}

	onMount(() => {
		;(async () => {
			await loadHistory()
		})()

		return () => {
			try {
				chat.socket?.close()
			} catch (err) {
				console.error('error closing socket', err)
			}
		}
	})

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

		if (!chat.socket) return

		chat.socket.send(JSON.stringify(userMessage))

		resetUserMessage()
	}

	let textarea = $state<HTMLTextAreaElement>()
	let showContextOptions = $state(false)
	let caretPos = $state(0)

	function insertAtCaret(el: HTMLTextAreaElement, snippet: string) {
		// Native (preserves undo history)
		el.setRangeText(snippet, el.selectionStart, el.selectionEnd, 'end')
		// "end" places the caret after the inserted text
		el.dispatchEvent(new Event('input', { bubbles: true }))
	}

	// Callback function for ChatMention
	async function insertMention(item: Item) {
		if (!textarea) {
			return
		}

		const fullNode = getCurrentContainer().spec.nodes[item.id]

		// Add selected node to context
		userMessage.data.context = {
			...userMessage.data.context,
			[`@${item.name}`]: {
				component_id: fullNode.component_id
			}
		}

		// First update textarea, then set userMessage based on the updated content in textarea
		insertAtCaret(textarea, `${item.name} `)
		userMessage.data.content[0].text = textarea.value

		await tick()

		// Make sure caret ends up at the right position
		textarea.focus()
		const newCaretPos = item.name.length + caretPos + 2
		textarea.selectionStart = newCaretPos
		textarea.selectionEnd = newCaretPos
	}

	// Options for ChatMention
	const nodeList = $derived.by(() => {
		return Object.entries(getCurrentContainer().spec.nodes).map(([id, node]) => ({
			id,
			name: node.spec.meta.name,
			resource: node.spec.resource
		}))
	})

	// Derived state to track if we're waiting for assistant response
	const allMessages = $derived.by(() => {
		// Get all messages in chronological order
		const allMessages: MessageData[] = []
		function collectMessages(items: ParsedItem[]) {
			for (const item of items) {
				if (item.type === 'message') {
					allMessages.push(item)
				} else if (item.type === 'run' || item.type === 'step') {
					collectMessages(item.children)
				}
			}
		}

		collectMessages(chat.data)

		return allMessages
	})

	const isWaitingForAssistant = $derived.by(() => {
		if (allMessages.length === 0) {
			return false
		}

		const lastMessage = allMessages[allMessages.length - 1]

		return lastMessage.role === 'assistant' && lastMessage.content.length === 0
	})
</script>

<div
	class="bg-main-950/60 custom-scrollbar scroll-gutter-stable border-main-800 row-span-3 grid grid-rows-[1fr_auto] rounded-lg border"
>
	<div class="overflow-y-auto p-4" bind:this={chatMessagesContainer} use:initChat>
		<ul class="chat grid gap-4 pb-6 text-sm">
			{#each chat.data as item}
				<ChatItem {item} />
			{/each}

			<li>
				<span
					class={[
						'flex items-center gap-1.5 font-medium transition-opacity duration-200',
						isWaitingForAssistant ? 'opacity-100 delay-300' : 'opacity-0'
					]}
				>
					<LogoSpinner class="size-5" />
				</span>
			</li>
		</ul>
	</div>

	<!-- <div class="px-4 pb-4 leading-none">
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
					if (e.key === 'Enter') {
						if (!e.shiftKey) {
							e.preventDefault()
							sendMessage(e)
							return
						}
					}

					if (e.key === '@') {
						showContextOptions = true
					}
				}}
				bind:value={userMessage.data.content[0].text}
				class="field-sizing-content max-h-30 min-h-16 w-full resize-none pb-2 outline-0"
				placeholder="Talk to your project"
			></textarea>

			<Button variation="vibrant" type="submit" class="ms-auto -me-2 -mb-1 px-2 py-1 text-sm">
				<div class="flex items-center gap-0.5">
					Send

					<kbd>↵</kbd>
				</div>
			</Button>
		</form>
	</div> -->
</div>
