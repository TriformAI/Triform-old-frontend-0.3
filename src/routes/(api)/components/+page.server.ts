import type { Component } from '$lib/types/resources'

import { error, json } from '@sveltejs/kit'

export const actions = {
	async create({ request, locals }) {
		if (!locals.user) {
			return error(401, 'Unauthorized')
		}

		const data: Component = await request.json()
		console.log('creating component', data)
		const createdComponent = await locals.api.post('components', data)

		return json(createdComponent)
	}
}
