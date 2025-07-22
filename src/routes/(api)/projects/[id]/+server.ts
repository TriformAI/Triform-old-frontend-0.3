import { error, json } from '@sveltejs/kit'

// Save a project
export async function PUT({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data = await request.json()
	const updatedProject = await locals.api.put(`projects/${data.meta.id}`, data)

	return json(updatedProject)
}
