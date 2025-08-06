import { API } from '$lib/api'
import type { Project } from '$lib/types/resources'

const api = new API()

export const createProject = async (payload: unknown) => {
	return await api.post<Project>(`projects`, payload)
}

export const saveProject = async (project: Project) => {
	return await api.patch<Project>(`projects/${project.id}`, project)
}
