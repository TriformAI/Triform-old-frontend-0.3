import { API } from '$lib/api'
import type { Project } from '$lib/types/project'

const api = new API()

export const saveProject = async (project: Project) => {
	return await api.put<Project>('projects', project)
}
