import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
	// Don't let unauthenticated users access the app
	if (!locals.user) {
		redirect(302, '/')
	}

	return {
		user: locals.user
	}
}
