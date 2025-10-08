<script lang="ts">
	import Chat from './Chat.svelte'
	import { page } from '$app/state'
	import { getMessages as httpGetMessages, cancelChat as httpCancelChat } from '$lib/actions/chat'
	import type { ChatUrlBuilder } from '$lib/stores/chat.svelte'

	let { onMessage }: { onMessage?: () => void } = $props()

	const id = $derived(page.params.id)
	const buildWsUrl: ChatUrlBuilder = ({ id, startId }) =>
		`/api/projects/${id}/chat?startId=${startId}`
	const enableContextMentions = true
	const initialMessage = $derived(page.state.initPrompt)

	const getMessages = async (maybeId?: string) => (await httpGetMessages((maybeId || id)!)).data

	const cancel = async (maybeId?: string) => {
		return await httpCancelChat((maybeId || id)!)
	}
</script>

<Chat
	{onMessage}
	{id}
	{getMessages}
	{buildWsUrl}
	{enableContextMentions}
	{cancel}
	{initialMessage}
/>
