import { API } from '$lib/api'

const api = new API()

export const cancelChat = async (projectId: string) => {
  const res = await api.post(`projects/${projectId}/chat/cancel`, {})
	return res.success
}