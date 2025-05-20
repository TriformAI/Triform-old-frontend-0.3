import { API } from '$lib/api'
import type { Component } from '$lib/types/agent'

const api = new API()

export const updateComponent = async (component: Component) => {
	console.log('component', component)

	return await api.put<Component>(`components/${component.meta.id}`, component)
}

export const createComponent = async (component: Component) => {
	return await api.post<Component>('components', component)
}
