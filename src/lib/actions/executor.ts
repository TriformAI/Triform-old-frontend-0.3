import type { Component } from '$lib/types/agent'
import type { Execution } from '$lib/types/execution'

const baseUrl = import.meta.env.VITE_TRICORE_URL

export const saveComponent = async (component: Component) => {
	console.log('saving component', component)
}

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
