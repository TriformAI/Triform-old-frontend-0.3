import { API } from '$lib/api'
import type { Invite } from '$lib/types/auth'

const api = new API()

export const getInvites = async () => await api.get<{ data: Invite[] }>('/users/@me/invites')

export const acceptInvite = async (invite: string) => await api.post<{ data?: string, error?: string }>(`/users/@me/invites/accept`, { invite })