import { API } from '$lib/api'
import type { Component, ResolvedComponent } from '$lib/types/resources'
import { actionModel, componentModel } from '$lib/schemas'
import type * as z from 'zod'
import { pick } from '$lib/utils/pick'
import { unresolveComponent } from '$lib/utils/unresolveComponent'
import { updateLocalComponent } from '$lib/stores/canvas.svelte'
import { requirementsModel } from '$lib/schemas/requirements'

type Requirements = z.infer<typeof requirementsModel> & {
	id?: string
}

const api = new API()

export const getRequirements = async (type: 'components' | 'projects', id: string) => {
	return await api.get<{ data: Requirements }>(`${type}/${id}/requirements`)
}

export const upsertRequirements = async (
	type: 'components' | 'projects',
	id: string,
	payload: Requirements
) => {
	return await api.patch<{ data: Requirements }>(`${type}/${id}/requirements`, payload)
}

export const updateComponent = async (
	component: Partial<z.infer<typeof componentModel> | ResolvedComponent>,
	updateLocal: boolean = true
) => {
	const unresolved = unresolveComponent(component as ResolvedComponent)
	const res = await api.patch<{ data: Component }>(
		`components/${component.id}`,
		pick(unresolved, ['spec', 'meta'])
	)
	if (res.success && updateLocal) updateLocalComponent(res.data)
	return res
}

export const createComponent = async (component: Omit<ResolvedComponent, 'id'>) => {
	const result = await api.post<{ data: ResolvedComponent }>('components', component)
	console.log(result)

	return result
}

export const getComponent = async (id: string) => {
	return await api.get<{ data: ResolvedComponent }>(`components/${id}`)
}

export const buildComponent = async (id: string) => {
	return await api.post<{ data: z.infer<typeof actionModel> }>(`components/${id}/build`, {})
}

export const generateRequirements = async (id: string) => {
	return await api.post<{ data: Requirements }>(`components/${id}/requirements/generate`, {})
}