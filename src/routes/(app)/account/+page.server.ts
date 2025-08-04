import type { Token } from '$lib/types/auth'

export const actions = {
	async createToken({ request, locals }) {},

	async createAPIToken({ request, locals }) {},

	async deleteToken({ request, locals }) {},

	async joinOrganization({ request, locals }) {},

	async leaveOrganization({ request, locals }) {},

	async activateOrganization({ request, locals }) {},

	async deactivateOrganization({ request, locals }) {}
}

export const load = async ({ locals }) => {
	const tokens = await locals.api.get<Token[]>('tokens')
	const organizations = locals.organizations

	return {
		tokens,
		organizations
	}
}
