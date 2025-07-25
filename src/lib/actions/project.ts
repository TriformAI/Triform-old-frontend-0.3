import { API } from '$lib/api'
import type { Project } from '$lib/types/resources'

const api = new API()

export const saveProject = async (project: Project) => {
	const id = project.id
	delete project.id
	project.spec.nodes = Object.fromEntries(
		Object.entries(project.spec.nodes).map(([id, node]) => {
			const { component_id } = node
			return [id, { component_id }]
		})
	)
	return await api.put<Project>(`projects/${id}`, project)
}
