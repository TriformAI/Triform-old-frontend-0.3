export const actions = {
	async create({ request, locals }) {
		const formData = await request.formData()
		console.log(formData)

		return true
	}
}
