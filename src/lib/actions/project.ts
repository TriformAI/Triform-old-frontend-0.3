import { API } from '$lib/api'
import type { resolvedProjectModel } from '$lib/schemas'
import { requirementsModel } from '$lib/schemas/requirements'
import type { Project } from '$lib/types/resources'
import { unresolveProject } from '$lib/utils/unresolveComponent'
import { pick } from '$lib/utils/pick'
import type * as z from 'zod'

const api = new API()

export const createProject = async (payload: unknown) => {
	return await api.post<{ data: Project }>(`projects`, payload)
}

export const saveProject = async (project: z.infer<typeof resolvedProjectModel>) => {
	return await api.patch<{ data: Project }>(
		`projects/${project.id}`,
		pick(unresolveProject(project), ['spec', 'meta'])
	)
}

export const generateRequirements = async (id: string) => {
	return await api.post<{ data: z.infer<typeof requirementsModel> }>(`projects/${id}/requirements/generate`, {})
}