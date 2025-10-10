import { API } from '$lib/api'
import type { chatTriggerUiMessageModel } from '$lib/schemas/chat.js'
import type * as z from 'zod'

const api = new API()

// export const cancelChat = async (projectId: string) => {
//   const res = await api.post(`projects/${projectId}/chat/cancel`, {})
// 	return res.success
// }

export const getMessages = async (threadId: string) => await api.get(`chat/threads/${threadId}/messages`)

export interface Thread {
  id: string
  title: string
  createdAt: string
}

export interface Message {
  id: string
  data: z.infer<typeof chatTriggerUiMessageModel>
  createdAt: string
}

export const getThreads = async () => await api.get<{ data: Thread[] }>(`chat/threads`)
export const createThread = async (initialMessage: string) => await api.post<{ data: Thread }>(`chat/threads`, { initialMessage })