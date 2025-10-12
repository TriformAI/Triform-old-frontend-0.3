<script lang="ts">
	import ChatInput from '$lib/components/Chat/ChatInput.svelte'
	import { createThread } from '$lib/actions/chat'
	import { goto } from '$app/navigation'
	import { toast } from 'svelte-sonner'
	import { threads } from '$lib/stores/triggerChat.svelte'

	let message = $state('')
	let textarea = $state<HTMLTextAreaElement>()
	let isWaitingForAssistant = $state(false)
	let isLoading = $state(false)

	const sendMessage = async () => {
		isLoading = true
		const { success, data: thread } = await createThread(message)
		if (!success) {
			isLoading = false
			return toast.error('Failed to create thread')
		}
		threads.unshift(thread)
		goto(`/chat/${thread.id}`, {
			state: {
				initialMessage: message
			}
		})
	}
</script>

<div class="flex h-full min-h-0 flex-col justify-end overflow-y-auto pb-0.5">
	<ChatInput
		bind:message
		bind:textarea
		enableContextMentions={false}
		isOpen={false}
		nodeList={[]}
		contextChips={[]}
		highlights={[]}
		{isWaitingForAssistant}
		{isLoading}
		onSubmit={sendMessage}
		onCancel={() => {}}
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
