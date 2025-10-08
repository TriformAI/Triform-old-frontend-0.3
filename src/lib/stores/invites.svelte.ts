import type { Invite } from '$lib/types/auth'
import { getInvites as getInvitesAction } from '$lib/actions/user'

let invitesStore = $state<Invite[]>([])
const activeInvites = $derived(invitesStore.filter(i => !i.recipient && (i.expiresAt && new Date(i.expiresAt) > new Date())))
export const getInvites = () => invitesStore
export const getActiveInvites = () => activeInvites

export const refreshInvites = async () => {
	const invites = await getInvitesAction()
	invitesStore = invites.data ?? []
}