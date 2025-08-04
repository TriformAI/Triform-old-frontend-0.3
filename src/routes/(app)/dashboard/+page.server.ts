import type { Project } from '$lib/types/resources'

export async function load({ locals }) {
	const { data: projects } = await locals.api.get<Project[]>('projects')

	return {
		projects
	}
}
