import { API } from '$lib/api'
import type { uiMessagesModel } from '$lib/schemas/chat'
import type { resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'

const api = new API()

export const cancelChat = async (projectId: string) => {
  const res = await api.post(`projects/${projectId}/chat/cancel`, {})
	return res.success
}

export const getMessages = async (projectId: string) => await api.get(`projects/${projectId}/chat/messages`)

export const createThread = async (projectId: string) => await api.post(`projects/${projectId}/chat/threads`, {})

export const revert = async (projectId: string, snapshot: string) => await api.post<{ data: { project: z.infer<typeof resolvedProjectModel>, uiMessages: z.infer<typeof uiMessagesModel> } }>(`projects/${projectId}/chat/revert`, { snapshot })