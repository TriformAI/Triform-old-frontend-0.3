import { API } from '$lib/api'
import type { Component, Uuid } from '$lib/types/agent'

const api = new API()

export const updateComponent = async (component: Component) => {
	console.log('component', component)

	return await api.put<Component>(`components/${component.meta.id}`, component)
}

export const updateComponentPositions = async (
	id: Uuid,
	positions: Record<Uuid, { x: number; y: number }>
) => {
	return await api.patch<{ updated: number; success: boolean }>(`components/${id}/positions`, {
		id,
		positions
	})
}

export const createComponent = async (component: Component) => {
	return await api.post<Component>('components', component)
}

export const getComponent = async (id: Uuid) => {
	return await api.get<Component>(`components/${id}`)
}
