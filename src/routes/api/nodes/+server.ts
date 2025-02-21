import type { Component } from '$lib/types/agent'
import type { Execution } from '$lib/types/execution'

import { error, json } from '@sveltejs/kit'

// Publish a component
export async function PUT({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data = await request.json()
	const updatedComponent = await locals.api.put(`component/publish/${data.meta.id}`, data)
	return json(updatedComponent)
}

// Execute a component
export async function POST({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	interface Payload {
		input: Record<string, unknown>
		component: Component
	}

	const { input, component }: Payload = await request.json()

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
	const result = await locals.api.post(`run`, execution)

	return json(result)
}
