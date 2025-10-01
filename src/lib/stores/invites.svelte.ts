import type { Invite } from '$lib/types/auth'
import { getInvites as getInvitesAction } from '$lib/actions/user'

let invitesStore = $state<Invite[]>([])
export const getInvites = () => invitesStore

export const refreshInvites = async () => {
	const invites = await getInvitesAction()
	invitesStore = invites.data ?? []
}