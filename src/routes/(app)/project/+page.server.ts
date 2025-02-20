import { redirect } from '@sveltejs/kit'

export const load = () => {
	redirect(302, '/dashboard')
}

export const actions = {
	async create({ request }) {
		const formData = await request.formData()
		console.log(formData)

		return true
	}
}
