import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const baseUrl = import.meta.env.VITE_TRICORE_AUTH_URL

const authHandle: Handle = async ({ event, resolve }) => {
	const auth_token = event.cookies.get('triform_key')

	// Just resolve if no auth token is found in cookies
	if (!auth_token) {
		return resolve(event)
	}

	// Try to fetch the user
	try {
		const response = await fetch(`${baseUrl}/users/@me`, {
			headers: {
				'Content-Type': 'application/json',
				Cookie: `triform_key=${auth_token}`
			}
		})

		// If response is ok, a user was fetched – store the user object in locals
		if (response.ok) {
			const user = await response.json()
			if (user) {
				event.locals.user = user
			}
		}
	} catch (error) {
		console.error(error)
	}

	return resolve(event)
}

export const handle = sequence(authHandle)
