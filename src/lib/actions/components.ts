import { API } from '$lib/api'
import type { Component } from '$lib/types/agent'

const api = new API()

export const publishComponent = async (component: Component) => {
	return await api.put<Component>('components', component)
}

export const createComponent = async (component: Component) => {
	return await api.post<Component>('components', component)
}
