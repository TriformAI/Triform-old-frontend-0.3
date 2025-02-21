import type { Component } from '$lib/types/agent'
import type { Execution } from '$lib/types/execution'

import { error, json } from '@sveltejs/kit'

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
