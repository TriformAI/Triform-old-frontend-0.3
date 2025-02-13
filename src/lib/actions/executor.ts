import type { Component } from '$lib/types/agent'
import type { Execution } from '$lib/types/execution'

const baseUrl = `${import.meta.env.VITE_TRICORE_URL}/v1`

export const publishComponent = async (component: Component) => {
	console.log('publishing component', component)
	const res = await fetch(`${baseUrl}/component/publish/${component.meta.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(component)
	})
	const updatedComponent = await res.json()
	console.log('published component', updatedComponent)
	return updatedComponent
}

export const saveComponent = async (component: Component) => {}

export const executeComponent = async (component: Component, input: Record<string, unknown>) => {
	const execution: Execution = {
		resource: 'execution/v1',
		input,
		turbo: true,
		spec: {
			component_id: component.meta.id,
			component_version: component.meta.version
		}
	}
	console.log('executing component', component, execution)
	const res = await fetch(`${baseUrl}/run`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(execution)
	})
	return await res.json()
}