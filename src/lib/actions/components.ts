import { API } from '$lib/api'
import type { UUID as Uuid } from 'crypto'
import type { Component } from '$lib/types/resources'
import { resolvedComponentModel, componentModel } from '$lib/schemas'
import type * as z from 'zod'
import { pick } from '$lib/utils/pick'
import { unresolveComponent } from '$lib/utils/unresolveComponent'

const api = new API()

export const updateComponent = async (
	component: Partial<z.infer<typeof componentModel> | z.infer<typeof resolvedComponentModel>>
) => {
	const unresolved = unresolveComponent(component as z.infer<typeof resolvedComponentModel>)
	return await api.patch<Component>(
		`components/${component.id}`,
		pick(unresolved, ['spec', 'meta'])
	)
}

export const createComponent = async (component: Component) => {
	const result = await api.post<Component>('components', component)
	console.log(result)

	return result.data
}

export const getComponent = async (id: Uuid) => {
	return await api.get<Component>(`components/${id}`)
}
