import * as Sentry from '@sentry/sveltekit'
import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { API } from '$lib/api'
import { env } from '$env/dynamic/private'

const apiUrl = env.API_URL

const authHandle: Handle = async ({ event, resolve }) => {
	const authToken = event.cookies.get('__Secure-better-auth.session_token')

	// Just resolve if no auth token is found in cookies
	if (!authToken) {
		return resolve(event)
	}

	try {
		const { session: sessionData } = JSON.parse(
			Buffer.from(event.cookies.get('__Secure-better-auth.session_data')!, 'base64url').toString(
				'utf8'
			)
		)

		event.locals.session = sessionData.session
		event.locals.user = sessionData.user
	} catch (error) {}

	event.locals.isAuthenticated = true

	// Initialize API instance and make available to locals
	const api = new API(apiUrl, event)
	event.locals.api = api

	return resolve(event)
}

export const handle = sequence(Sentry.sentryHandle(), sequence(authHandle))
export const handleError = Sentry.handleErrorWithSentry()
