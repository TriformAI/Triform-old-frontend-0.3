import { API } from '$lib/api'
import { type Component } from '$lib/types/agent'

const api = new API()

export async function saveDraft(component: Component, componentId: string) {
	await api.patch(`components/${componentId}/draft`, component)
}
