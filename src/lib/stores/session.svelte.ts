import { authClient } from '$lib/auth-client'
import type { User, Session } from 'better-auth/types'

type CustomSession = Session & {
	activeOrganizationId?: string | null
}

interface SessionState {
	session: CustomSession | null
	user: (User & { active: boolean }) | null
	isLoading: boolean
	error: string | null
}

class SessionStore {
	private state = $state<SessionState>({
		session: null,
		user: null,
		isLoading: false,
		error: null
	})

	constructor() {
		this.getSession()
	}

	// Reactive getters
	get session() {
		return this.state.session
	}

	get user() {
		return this.state.user
	}

	get isLoading() {
		return this.state.isLoading
	}

	get error() {
		return this.state.error
	}

	get isAuthenticated() {
		return !!this.state.session && !!this.state.user
	}

	// Get current session
	async getSession() {
		this.state.isLoading = true
		this.state.error = null

		try {
			const { data: session, error } = await authClient.getSession()

			if (error) {
				this.state.error = error.message || 'Failed to get session'
				this.state.session = null
				this.state.user = null
			} else {
				this.state.session = session?.session || null
				this.state.user = session?.user || null
			}
		} catch (err) {
			this.state.error = err instanceof Error ? err.message : 'Unknown error occurred'
			this.state.session = null
			this.state.user = null
		} finally {
			this.state.isLoading = false
		}

		return {
			session: this.state.session,
			user: this.state.user,
			error: this.state.error
		}
	}

	// Refresh session
	async refreshSession() {
		return this.getSession()
	}

	// Clear session (for logout)
	clearSession() {
		this.state.session = null
		this.state.user = null
		this.state.error = null
	}

	// Set loading state (useful for external operations)
	setLoading(loading: boolean) {
		this.state.isLoading = loading
	}
}

// Create and export the singleton session store
export const sessionStore = new SessionStore()
