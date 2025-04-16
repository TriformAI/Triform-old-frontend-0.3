import { error, json } from '@sveltejs/kit'
import type { Component } from '$lib/types/agent'

// Delete a node
export async function DELETE({ locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	return json({ success: true })
}

// Publish a component
export async function PUT({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	const data: Component = await request.json()
	console.log(JSON.stringify(data))

	console.log('publishing component', data)

	if (!data.meta.id) return error(400, 'Component must have an id')

	const updatedComponent = await locals.api.put<Component>(
		`components/publish/${data.meta.id}`,
		data
	)

	return json(updatedComponent)
}
