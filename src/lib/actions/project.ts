import { API } from '$lib/api'
import type { deployedProjectDataModel, resolvedProjectModel } from '$lib/schemas'
import { requirementsModel } from '$lib/schemas/requirements'
import type { Project } from '$lib/types/resources'
import { unresolveProject } from '$lib/utils/unresolveComponent'
import { pick } from '$lib/utils/pick'
import type * as z from 'zod'
import { generatedProjectMetaModel } from '$lib/schemas/projects'

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

export const deleteProject = async (id: string) => await api.delete<{ data?: { message: string }, error?: string }>(`projects/${id}`)

export const generateRequirements = async (id: string) => {
	return await api.post<{ data: z.infer<typeof requirementsModel> }>(`projects/${id}/requirements/generate`, {})
}

export const deployProject = async (id: string) => await api.post<{ data: z.infer<typeof deployedProjectDataModel> & { spec: z.infer<typeof resolvedProjectModel>['spec'] } }>(`projects/${id}/deploy`, {})

export const getDeployments = async (id: string) => await api.get<{ data: z.infer<typeof deployedProjectDataModel>[] }>(`projects/${id}/deployments`)

export const generateProjectMeta = async (prompt: string) => await api.post<{ data: z.infer<typeof generatedProjectMetaModel> }>(`projects/metadata/generate`, { prompt })