<script lang="ts">
	import data from '$lib/chat-mock.json'
	import { onMount } from 'svelte'
	import ChatItem from './ChatItem.svelte'
	import { handleMessage, parseHistory, chat } from './chatStore.svelte'
	import Button from '../atoms/Button.svelte'
	import { page } from '$app/state'
	import { getMessages } from '$lib/remote/chat.remote'
	import { WebSocket } from 'partysocket'
	import { sleep } from '$lib/utils/sleep'

	let socket = $state<WebSocket>()

	//$inspect(chat.data)

	$effect(() => {
		;(async () => {
			chat.data = []
			const messages = await getMessages(page.params.id!)

			parseHistory(messages)
		})()
	})

	onMount(async () => {
		socket = new WebSocket(`/api/projects/${page.params.id}/chat`)

		socket.onopen = () => {
			console.log('WebSocket connected')
		}

		socket.onmessage = async e => {
			const { event, data } = JSON.parse(e.data)

			if (event === 'ack' && data.event === 'text_message_started') {
				sendMessage(data.id)
			}

			if (data) {
				handleMessage(data)
			}
		}

		socket.onclose = () => {
			console.log('Socket closed')
		}

		socket.onerror = err => {
			console.error('Socket error', err)
		}
	})

	let message = $state('')

	async function sendMessage(sourceId: string) {
		socket?.send(
			JSON.stringify({
				event: 'text_message_content',
				sourceId,
				data: {
					delta: message
				}
			})
		)

		message = ''

		socket?.send(
			JSON.stringify({
				event: 'text_message_end',
				sourceId,
				data: {}
			})
		)
	}

	function initMessage(event: Event) {
		if (message.trim().length === 0) {
			return
		}

		event.preventDefault()

		if (!socket) return
		socket.send(
			JSON.stringify({
				event: 'text_message_started',
				data: {
					role: 'user'
				}
			})
		)
	}
</script>

<div
	class="bg-main-950/60 custom-scrollbar scroll-gutter-stable border-main-800 row-span-3 grid grid-rows-[1fr_auto] rounded-lg border py-4"
>
	<div class="overflow-y-auto px-4">
		<ul class="chat grid gap-4 pb-6 text-sm">
			{#each chat.data as item}
				<li>
					<ChatItem {item} />
				</li>
			{/each}
		</ul>
	</div>

	<div class="px-4 leading-none">
		<form onsubmit={initMessage} class="grid *:col-start-1 *:row-start-1">
			<textarea
				onkeydown={e => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
						e.preventDefault()
						initMessage(e)
					}
				}}
				bind:value={message}
				class="input-text"
				rows="3"
				placeholder="Talk to your project"
			></textarea>

			<Button variation="vibrant" type="submit" class="m-2 ms-auto mt-auto px-2 py-1 text-sm">
				<div class="flex items-center gap-0.5">
					Send
					<kbd class="ms-2">⌘</kbd>
					<kbd>↵</kbd>
				</div>
			</Button>
		</form>
	</div>
</div>
