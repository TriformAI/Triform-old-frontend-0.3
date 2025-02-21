import { fail, redirect } from '@sveltejs/kit'

export const load = () => {
	redirect(302, '/dashboard')
}

export const actions = {
	async create({ request }) {
		const formData = await request.formData()
		const name = formData.get('name')

		if (!name) {
			return fail(400, { message: 'Invalid input' })
		}

		return false
	}
}
