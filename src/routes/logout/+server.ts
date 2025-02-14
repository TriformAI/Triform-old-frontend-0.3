import { redirect } from '@sveltejs/kit'

export async function POST({ cookies }) {
	cookies.delete('triform_key', {
		domain: 'localhost',
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	})

	redirect(302, '/login')
}
