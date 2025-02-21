import type { Component } from '$lib/types/agent'

import { error, json } from '@sveltejs/kit'

// Publish a component
export async function PUT({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data: Component = await request.json()

	console.log('publishing component', data)

	let updatedComponent: Component
	// If we're trying to publish a v1 component, we need to create it first
	// (I think this will be handled on the backend in the future)
	if (data.meta.version === 1) updatedComponent = await locals.api.post('components/publish', data)
	else updatedComponent = await locals.api.put(`components/publish/${data.meta.id}`, data)

	return json(updatedComponent)
}
