import type { Project } from '$lib/types/project'

export async function load({ locals, params }) {
	const project = await locals.api.get<Project>(`projects/${params.id}?depth=999`)

	return {
		project
	}
}

export const actions = {
	async delete({ request }) {
		// Send a delete request to the API
		console.log('delete project')

		return true
	}
}
