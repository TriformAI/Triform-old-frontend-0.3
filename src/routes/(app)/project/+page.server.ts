export const actions = {
	async create({ request }) {
		const formData = await request.formData()
		console.log(formData)

		return true
	}
}
