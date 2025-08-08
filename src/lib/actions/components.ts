import { API } from '$lib/api'
import type { UUID as Uuid } from 'crypto'
import type { Component, ResolvedComponent } from '$lib/types/resources'
import { componentModel } from '$lib/schemas'
import type * as z from 'zod'
import { pick } from '$lib/utils/pick'
import { unresolveComponent } from '$lib/utils/unresolveComponent'

const api = new API()

export const updateComponent = async (
	component: Partial<z.infer<typeof componentModel> | ResolvedComponent>
) => {
	const unresolved = unresolveComponent(component as ResolvedComponent)
	return await api.patch<{ data: Component }>(
		`components/${component.id}`,
		pick(unresolved, ['spec', 'meta'])
	)
}

export const createComponent = async (component: Omit<ResolvedComponent, 'id'>) => {
	const result = await api.post<{ data: ResolvedComponent }>('components', component)
	console.log(result)

	return result
}

export const getComponent = async (id: Uuid) => {
	return await api.get<{ data: ResolvedComponent }>(`components/${id}`)
}
