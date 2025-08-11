import { createAuthClient } from 'better-auth/svelte'
import { organizationClient } from 'better-auth/client/plugins'
import { env } from '$env/dynamic/public'

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: `${env.PUBLIC_API_URL}/auth`,
	plugins: [organizationClient()]
})
