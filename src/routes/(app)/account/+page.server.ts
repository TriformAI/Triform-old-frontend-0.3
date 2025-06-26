import type { Token } from '$lib/types/auth'
import { db } from '$lib/db'
import { organizations as orgTable, userOrganizations } from '$lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { fail } from '@sveltejs/kit'

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
	},

	async joinOrganization({ request, locals }) {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string

		if (!id) {
			return fail(400, { message: 'Organization ID required' })
		}

		// Check that organization exists
		const [org] = await db.select().from(orgTable).where(eq(orgTable.id, id)).limit(1)

		if (!org) {
			return fail(404, { message: 'Organization not found' })
		}

		// Insert association, ignore if already exists
		await db
			.insert(userOrganizations)
			.values({ user_id: locals.user.id, organization_id: id })
			.onConflictDoNothing()

		return { success: true }
	},

	async leaveOrganization({ request, locals }) {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string

		if (!id) {
			return fail(400, { message: 'Organization ID required' })
		}

		// Delete association; ignore if not present
		await db
			.delete(userOrganizations)
			.where(
				and(
					eq(userOrganizations.user_id, locals.user.id),
					eq(userOrganizations.organization_id, id)
				)
			)

		return { success: true }
	},

	async activateOrganization({ request, locals }) {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' })
		}

		const formData = await request.formData()
		const id = formData.get('id') as string

		if (!id) {
			return fail(400, { message: 'Organization ID required' })
		}

		// ensure association exists
		const [assoc] = await db
			.select()
			.from(userOrganizations)
			.where(
				and(
					eq(userOrganizations.user_id, locals.user.id),
					eq(userOrganizations.organization_id, id)
				)
			)
			.limit(1)

		if (!assoc) {
			return fail(404, { message: 'Organization not found for user' })
		}

		// reset all active flags then set active for selected org
		await db
			.update(userOrganizations)
			.set({ active: false })
			.where(eq(userOrganizations.user_id, locals.user.id))

		await db
			.update(userOrganizations)
			.set({ active: true })
			.where(
				and(
					eq(userOrganizations.user_id, locals.user.id),
					eq(userOrganizations.organization_id, id)
				)
			)

		return { success: true }
	},

	async deactivateOrganization({ request, locals }) {
		if (!locals.user) return fail(401, { message: 'Unauthorized' })

		const formData = await request.formData()
		const id = formData.get('id') as string

		if (!id) return fail(400, { message: 'Organization ID required' })

		// ensure association exists
		const [assoc] = await db
			.select()
			.from(userOrganizations)
			.where(
				and(
					eq(userOrganizations.user_id, locals.user.id),
					eq(userOrganizations.organization_id, id)
				)
			)
			.limit(1)

		if (!assoc) return fail(404, { message: 'Organization not found for user' })

		// set active false only for that association
		await db
			.update(userOrganizations)
			.set({ active: false })
			.where(
				and(
					eq(userOrganizations.user_id, locals.user.id),
					eq(userOrganizations.organization_id, id)
				)
			)

		return { success: true }
	}
}

export const load = async ({ locals }) => {
	const tokens = await locals.api.get<Token[]>('tokens')
	const organizations = locals.organizations

	return {
		tokens,
		organizations
	}
}
