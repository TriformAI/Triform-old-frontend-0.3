import type { Project } from '$lib/types/project'

export async function load({ locals }) {
	const projects = await locals.api.get<Project['meta'][]>('projects')

	return {
		projects
	}
}
