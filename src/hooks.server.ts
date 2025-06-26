import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { API } from '$lib/api'
import type { Organization, User } from '$lib/types/auth'
import { organizations, userOrganizations } from '$lib/db/schema'
import { db } from '$lib/db'
import { eq } from 'drizzle-orm'

const authUrl = import.meta.env.VITE_TRICORE_AUTH_URL
const baseUrl = import.meta.env.VITE_TRICORE_INTERNAL_URL

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

	if (event.locals.user) {
		try {
			const orgs = (await db
				.select({
					id: organizations.id,
					name: organizations.name,
					token: organizations.token,
					active: userOrganizations.active
				})
				.from(userOrganizations)
				.where(eq(userOrganizations.user_id, event.locals.user.id))
				.innerJoin(
					organizations,
					eq(userOrganizations.organization_id, organizations.id)
				)) as Organization[]
			event.locals.organizations = orgs
			// if we have an active org, update the auth token for the main api instance
			const activeOrg = orgs.find((org: Organization) => org.active)
			if (activeOrg) {
				event.locals.api = new API(baseUrl, `Bearer ${activeOrg.token}`, event.fetch)
			}
		} catch (error) {
			console.error('Failed fetching organizations for user', error)
		}
	}

	return resolve(event)
}

export const handle = sequence(authHandle)
