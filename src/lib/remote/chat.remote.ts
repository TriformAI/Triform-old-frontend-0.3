import { query } from '$app/server'
import { getRequestEvent } from '$app/server'
import { uiMessageModel } from '$lib/schemas/chat'
import * as z from 'zod'
type Message = z.infer<typeof uiMessageModel>

export const getMessages = query(z.string(), async id => {
	const { locals } = getRequestEvent()
	console.log(`projects/${id}/chat/messages`)

	const { data: messages } = await locals.api.get<{ data: Message[] }>(
		`projects/${id}/chat/messages`
	)

	return messages
})
