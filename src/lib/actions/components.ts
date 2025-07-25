import { API } from '$lib/api'
import type { UUID as Uuid } from 'crypto'
import type { Component } from '$lib/types/resources'
import { page } from '$app/state'

const api = new API()

export const updateComponent = async (component: Component) => {
	console.log('component', component)

	return await api.put<Component>(`components/${component.id}`, component)
}

export const updateComponentPositions = async (
	id: Uuid,
	positions: Record<Uuid, { x: number; y: number }>
) => {
	page.data.positions[id] = {
		...page.data.positions[id],
		...positions
	}
	return await api.patch<{ updated: number; success: boolean }>(`components/${id}/positions`, {
		id,
		positions: page.data.positions[id]
	})
}

export const createComponent = async (component: Component) => {
	const result = await api.postRaw<Component>('components', component)
	console.log(result)

	return result.data
}

export const getComponent = async (id: Uuid) => {
	return await api.get<Component>(`components/${id}`)
}
