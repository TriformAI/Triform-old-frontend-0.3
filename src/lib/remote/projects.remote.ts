import { query } from '$app/server'
import { getRequestEvent } from '$app/server'
import type { Project } from '$lib/types/resources'

export const getProjects = query(async () => {
	const { locals } = getRequestEvent()
	const { data: projects } = await locals.api.get<Project[]>('projects')

	return projects
})
