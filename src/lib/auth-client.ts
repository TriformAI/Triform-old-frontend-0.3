import { createAuthClient } from 'better-auth/svelte'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: 'https://host.docker.internal:8080/api/auth',
	plugins: [organizationClient()]
})
