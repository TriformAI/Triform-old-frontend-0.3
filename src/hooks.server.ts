import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { API } from '$lib/api'
import { env } from '$env/dynamic/private'
const apiUrl = env.API_URL

const authHandle: Handle = async ({ event, resolve }) => {
	const authToken = event.cookies.get('better-auth.session_token')

	// Just resolve if no auth token is found in cookies
	if (!authToken) {
		return resolve(event)
	}

	event.locals.isAuthenticated = true
	console.log('apiUrl', apiUrl)
	// Initialize API instance and make available to locals
	const api = new API(apiUrl, event.fetch)
	event.locals.api = api

	try {
		// TODO Get orgs from API
		// const orgs = (await db
		// 	.select({
		// 		id: organizations.id,
		// 		name: organizations.name,
		// 		token: organizations.token,
		// 		active: userOrganizations.active
		// 	})
		// 	.from(userOrganizations)
		// 	.where(eq(userOrganizations.user_id, event.locals.user.id))
		// 	.innerJoin(
		// 		organizations,
		// 		eq(userOrganizations.organization_id, organizations.id)
		// 	)) as Organization[]
		// event.locals.organizations = orgs
		// // if we have an active org, update the auth token for the main api instance
		// const activeOrg = orgs.find((org: Organization) => org.active)
		// if (activeOrg) {
		// 	event.locals.api = new API(baseUrl, `Bearer ${activeOrg.token}`, event.fetch)
		// }
	} catch (error) {
		console.error('Failed fetching organizations for user', error)
	}

	return resolve(event)
}

export const handle = sequence(authHandle)
