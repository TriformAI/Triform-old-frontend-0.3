import type { Token } from '$lib/types/auth'

export const actions = {
	async createToken({ request, locals }) {
		const formData = await request.formData()
		const name = formData.get('name') as string
		const token = await locals.api.post<Token>('tokens', { name })
		return token
	},

	async createAPIToken({ request, locals }) {
		const formData = await request.formData()
		const name = formData.get('name') as string
		const token = await locals.api.post<Token>('tokens', { name })
		return token
	},

	async deleteToken({ request, locals }) {
		const formData = await request.formData()
		const name = formData.get('name') as string
		await locals.api.delete(`tokens/${name}`)
		return { success: true }
	}
}

export const load = async ({ locals }) => {
	const tokens = await locals.api.get<Token[]>('tokens')
	return {
		tokens
	}
}
