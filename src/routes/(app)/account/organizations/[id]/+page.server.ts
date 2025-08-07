import { error } from '@sveltejs/kit'

export async function load({ parent, params }) {
	const { memberships } = await parent()
	const currentOrgId = params.id

	const hasPermission =
		memberships.find(m => m.organization.id === currentOrgId)?.member.role !== 'member'

	if (!hasPermission) {
		error(401, 'You do not have permission to access this organization')
	}

	return {}
}
