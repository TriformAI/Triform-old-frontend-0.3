import { API } from '$lib/api'
import type { resolvedProjectModel } from '$lib/schemas'
import type { Project } from '$lib/types/resources'
import { unresolveProject } from '$lib/utils/unresolveComponent'
import { pick } from '$lib/utils/pick'
import type * as z from 'zod'

const api = new API()

export const createProject = async (payload: unknown) => {
	return await api.post<Project>(`projects`, payload)
}

export const saveProject = async (project: z.infer<typeof resolvedProjectModel>) => {
	return await api.patch<Project>(
		`projects/${project.id}`,
		pick(unresolveProject(project), ['spec', 'meta'])
	)
}
