import { redirect } from '@sveltejs/kit'

export function load({ locals }) {
	// Redirect to dashboard or login depending on logged-in state
	if (locals.isAuthenticated) {
		redirect(302, '/dashboard')
	}

	redirect(302, '/login')
}
