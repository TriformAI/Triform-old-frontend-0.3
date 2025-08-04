import { API } from '$lib/api'
import type { Project } from '$lib/types/resources'
import type { UUID } from 'crypto'

const api = new API()

export const saveProject = async (projectId: UUID, payload: unknown) => {
	return await api.patch<Project>(`projects/${projectId}`, payload)
}
