import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { API } from '$lib/api'
import type { User } from '$lib/types/auth'

const authUrl = import.meta.env.VITE_TRICORE_AUTH_URL
const baseUrl = import.meta.env.VITE_TRICORE_URL

const authHandle: Handle = async ({ event, resolve }) => {
	const authToken = event.cookies.get('triform_key')

	// Just resolve if no auth token is found in cookies
	if (!authToken) {
		return resolve(event)
	}

	const authApi = new API(authUrl, authToken)
	// Initialize API instance and make available to locals
	const api = new API(baseUrl, authToken, event.fetch)
	event.locals.api = api

	// Try to fetch the user
	try {
		const user = await authApi.get<User>(`users/@me`)
		event.locals.user = user
	} catch (error) {
		console.error(error)
	}

	return resolve(event)
}

export const handle = sequence(authHandle)
