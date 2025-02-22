import type { Component } from '$lib/types/agent'

import { error, json } from '@sveltejs/kit'

// Create a new component
export async function POST({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data: Component = await request.json()
	console.log('creating component', data)
	const createdComponent = await locals.api.post('components/publish', data)

	return json(createdComponent)
}

// Publish a component
export async function PUT({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data: Component = await request.json()

	console.log('publishing component', data)

	let updatedComponent
	if (data.meta.version === 0)
		updatedComponent = await locals.api.post<Component>('components/publish', data)
	else
		updatedComponent = await locals.api.put<Component>(`components/publish/${data.meta.id}`, data)

	return json(updatedComponent)
}
