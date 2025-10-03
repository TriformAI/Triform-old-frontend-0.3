<script lang="ts">
	import { onMount, tick } from 'svelte'
	import ChatItem from './ChatItem.svelte'
	import {
		chat,
		getUserMessage,
		type MessageData,
		type ParsedItem,
		type UserMessage,
		initChat,
		unregisterChatContainer
	} from '$lib/stores/chat.svelte'
	import Button from '../atoms/Button.svelte'
	import { page } from '$app/state'
	import { getMessages } from '$lib/remote/chat.remote'
	import ChatMention from './ChatMention.svelte'
	import { type Item } from './ChatMention.svelte'
	import { getCurrentContainer, getNodePath, getNodeByPath } from '$lib/stores/canvas.svelte'
	import LogoSpinner from '$lib/components/SpinnerLogo.svelte'
	import { userMessageModel } from '$lib/schemas/chat'
	import type * as z from 'zod'
	import { blur, fly } from 'svelte/transition'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import IconClose from '~icons/material-symbols/close-rounded'
	import { arraysDiffer } from '$lib/utils/arraysDiffer'
	import HighlightableTextarea from '../atoms/HighlightableTextarea.svelte'
	import { cancelChat } from '$lib/actions/chat'
	import { toast } from 'svelte-sonner'

	let {
		onMessage
	}: {
		onMessage?: () => void
	} = $props()

	let chatMessagesContainer = $state<HTMLElement>()

	onMount(() => {
		// Async initialization
		;(async () => {
			// Wait for chatMessagesContainer to be bound
			await tick()
			if (!chatMessagesContainer) {
				console.log('chatMessagesContainer not bound')
				return
			}

			// Initialize chat (shared across all Chat component instances)
			await initChat(page.params.id!, chatMessagesContainer, onMessage, getMessages)

			console.log('chat initialized', page.state)

			// if we got an init prompt from the page, fill it and then send it once the socket is connected
			if (page.state.initPrompt) {
				message = page.state.initPrompt
				if (message) sendMessage(new Event('submit'))
				page.state.initPrompt = undefined
			}
		})()

		// Unregister this container when the component unmounts
		return () => {
			if (chatMessagesContainer) {
				unregisterChatContainer(chatMessagesContainer, onMessage)
			}
		}
	})

	let message = $state('')
	let context = $state<z.infer<typeof userMessageModel>['data']['context']>({})

	function resetUserMessage() {
		message = ''
		context = {}
	}

	// small reactivity hack to ensure the derived is updated whenever moving the cursor
	let forceUpdateCharPos = $state(false)
	const caretPos = $derived.by(() => {
		const _ref = forceUpdateCharPos
		return textarea?.selectionStart ?? 0
	})
	const previousChar = $derived(caretPos > 0 ? message.at(Math.max(0, caretPos - 1)) : '')

	function sendMessage(event: Event) {
		if (!message.trim().length) return

		event.preventDefault()

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
	}

	const cancelRunningChat = async () => {
		const res = await cancelChat(page.params.id!)
		if (!res) return toast.error('Failed to cancel chat')
	}

	let textarea = $state<HTMLTextAreaElement>()

	const insertAtCaret = async (el: HTMLTextAreaElement, snippet: string) => {
		el.focus()
		await tick()
		// Native (preserves undo history)
		// "end" places the caret after the inserted text
		el.setRangeText(snippet, el.selectionStart, el.selectionEnd, 'end')
		el.dispatchEvent(new Event('input', { bubbles: true }))
	}

	// Callback function for ChatMention
	async function addToContext(id: string) {
		if (!textarea) return

		const fullNode = getCurrentContainer().spec.nodes[id]
		const name = fullNode.spec.meta.name

		// Add selected node to context
		context[`@${name}`] = {
			component_id: fullNode.component_id,
			node_path: [...(getNodePath()?.split('/') ?? []), id].filter(Boolean)
		}
		console.log('node_path', context[`@${name}`].node_path)

		// First update textarea, then set userMessage based on the updated content in textarea
		const mention = `${previousChar === '@' ? '' : '@'}${name} `
		forceUpdateCharPos = !forceUpdateCharPos
		await insertAtCaret(textarea, mention)
		message = textarea.value

		await tick()
	}

	const removeFromContext = (key: string) => {
		delete context[key]
		console.log(new RegExp(`${key}\s?`, ''))
		message = message.replace(new RegExp(`${key}\\s?`, ''), '').trim()
		forceUpdateCharPos = !forceUpdateCharPos
	}

	// Options for ChatMention
	const selectedNodePaths = $derived.by(() => Object.values(context).map(c => c.node_path))
	$inspect(selectedNodePaths)
	const nodeList = $derived.by(() => {
		return Object.entries(getCurrentContainer().spec.nodes)
			.map(([id, node]) => ({
				id,
				name: node.spec.meta.name,
				resource: node.spec.resource
			}))
			.filter(n =>
				selectedNodePaths.every(sp =>
					arraysDiffer([...(getNodePath()?.split('/') ?? []), n.id], sp ?? [])
				)
			)
	})

	const isWaitingForAssistant = $derived.by(() => {
		if (chat.data.length === 0) return false

		// Find the latest run (runs are added to chat.data in chronological order)
		const runs = chat.data.filter(item => item.type === 'run')
		if (runs.length === 0) return false

		const latestRun = runs[runs.length - 1]
		return !latestRun.completed
	})

	const onMentionClose = () => {
		// reset cursor pos to where it was before the mention
		if (!textarea) return
		textarea.selectionStart = caretPos
		textarea.selectionEnd = caretPos
		textarea.focus()
	}

	let isOpen = $derived(previousChar === '@')

	const onkeydown = (e: KeyboardEvent) => {
		setTimeout(() => (forceUpdateCharPos = !forceUpdateCharPos), 1)
		if (e.key === 'Enter') {
			if (!e.shiftKey) {
				e.preventDefault()
				sendMessage(e)
				return
			}
		} else if (e.key === 'Backspace') {
			// Check if we're deleting the last character of a context key
			const cursorPos = textarea?.selectionStart ?? 0
			if (cursorPos > 0) {
				// Look backwards to find a potential @mention
				const textBeforeCursor = message.substring(0, cursorPos)
				const atIndex = textBeforeCursor.lastIndexOf('@')

				if (atIndex === -1) return

				// Extract potential mention from @ to cursor
				const potentialMention = textBeforeCursor.substring(atIndex)

				// Check if this matches a context key and we're at the very end
				if (context[potentialMention] && cursorPos === atIndex + potentialMention.length) {
					// Prevent default backspace and delete entire context key
					e.preventDefault()
					removeFromContext(potentialMention)
				}
			}
		}
	}

	const oninput = () => {
		// if any of the keys in the context aren't in the message, remove them
		for (const key in context) if (!message.includes(key)) removeFromContext(key)
	}
</script>

<div
	class="bg-main-950/60 custom-scrollbar scroll-gutter-stable border-main-800 row-span-3 grid h-full grid-rows-[1fr_auto] rounded-lg border"
>
	<div class="grid items-start overflow-y-auto p-4" bind:this={chatMessagesContainer}>
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

	<div class="px-4 pb-4 leading-none">
		<form
			onsubmit={isWaitingForAssistant ? cancelRunningChat : sendMessage}
			class="input-text relative grid grid-rows-[1fr_auto] gap-2"
		>
			{#if isOpen}
				<div
					class="absolute inset-x-0 bottom-[calc(100%+0.25rem)]"
					transition:fly={{ y: 10, opacity: 0, duration: 200 }}
				>
					<ChatMention
						items={nodeList}
						onSelected={addToContext}
						bind:isOpen
						onClose={onMentionClose}
					/>
				</div>
			{/if}

			<div class="-ml-0.5 flex flex-row flex-wrap items-center justify-start gap-1">
				<Button
					variation="primary"
					type="button"
					class="text-main-400 shrink-0 px-2 py-1.5 text-xs"
					onClick={() => (isOpen = true)}
					fastClick={true}
					tooltip="Add a node to the context"
					tooltipPos="right"
				>
					@
				</Button>
				{#each Object.entries(context) as [key, value]}
					{@const node = getNodeByPath(value.node_path ?? [])}
					{@const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]}
					<div
						class={[
							'text-main-300 border-main-800 bg-main-850 rounded-md border px-2 py-1 text-sm transition',
							'hover:border-main-700 hover:text-main-200',
							'flex flex-row items-center gap-1.5',
							'group/item'
						]}
					>
						<div class="relative">
							{#if nodeTypeData}
								<nodeTypeData.icon
									class={[
										'mx-0.5 block size-3 transition group-hover/item:hidden starting:scale-0 starting:opacity-0',
										nodeTypeData.iconClasses
									]}
								/>
							{/if}
							<button
								onclick={() => removeFromContext(key)}
								class={[
									'h-full group-hover/item:block starting:scale-0 starting:opacity-0',
									nodeTypeData && 'hidden',
									'text-main-400 hover:text-main-200',
									'transition'
								]}
								type="button"
							>
								<IconClose class="size-4" />
							</button>
						</div>
						{key.split('@').slice(1).join('@')}
					</div>
				{/each}
			</div>

			<HighlightableTextarea
				bind:textarea
				{onkeydown}
				{oninput}
				onmousedown={() => setTimeout(() => (forceUpdateCharPos = !forceUpdateCharPos), 1)}
				bind:value={message}
				class="!z-0 field-sizing-content max-h-30 min-h-16 w-full resize-none pb-2 outline-0"
				placeholder="Build something magical"
				highlights={Object.entries(context).map(([key, value]) => {
					const node = getNodeByPath(value.node_path ?? [])
					const nodeTypeData = nodeTypesDict[node?.spec.resource.split('/')[0] as NodeType]
					return {
						text: key,
						fill: `color-mix(in oklab, color-mix(in oklab, ${nodeTypeData?.iconColor} 90%, black) 15%, transparent)`,
						border: 'transparent'
					}
				})}
			></HighlightableTextarea>

			<Button
				variation={isWaitingForAssistant ? 'warning' : 'vibrant'}
				type="submit"
				class="ms-auto -me-2 -mb-1 px-2 py-1 text-sm"
			>
				<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
					{#if !isWaitingForAssistant}
						<div
							class="col-start-1 row-start-1 flex items-center gap-0.5"
							transition:blur={{ duration: 500 }}
						>
							Send
							<kbd>↵</kbd>
						</div>
					{:else}
						<div class="col-start-1 row-start-1" transition:blur={{ duration: 500 }}>Cancel</div>
					{/if}
				</div>
			</Button>
		</form>
	</div>
</div>
