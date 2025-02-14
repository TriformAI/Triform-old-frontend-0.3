import type { User } from '$lib/types/auth'
import { FetchError } from '$lib/types/fetch'

const baseUrl = import.meta.env.VITE_TRICORE_AUTH_URL

export const getSelf = async (): Promise<User> => {
	const res = await fetch(`${baseUrl}/users/@me`, {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	})
	if (!res.ok) throw new FetchError(await res.text(), res.status)
	return (await res.json()) as User
}
