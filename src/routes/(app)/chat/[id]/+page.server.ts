import type { Message } from '$lib/actions/chat.js'

export async function load({ params, locals }) {
  const { success, data: messages} = await locals.api.get<{ data: Message[] }>(`chat/threads/${params.id}/messages`)
  if (!success) return { messages: [] }
  return { messages }
}