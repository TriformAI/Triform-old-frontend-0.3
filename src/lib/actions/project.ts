import { API } from '$lib/api'
import type { projectModel } from '$lib/schemas'
import type { z } from 'zod'

const api = new API()

export const saveProject = async (projectId: string, payload: unknown) => {
	return await api.patch<z.infer<typeof projectModel>>(`projects/${projectId}`, payload)
}
