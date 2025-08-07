import type { Organization, Member } from 'better-auth/plugins/organization'

export async function load({ locals }) {
	const { data } =
		await locals.api.get<{ member: Member; organization: Organization }[]>('users/@me/memberships')

	return {
		memberships: data
	}
}
