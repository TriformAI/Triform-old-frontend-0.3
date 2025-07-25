import { error, json } from '@sveltejs/kit'
import type { Payload } from '$lib/types/resources'

export async function POST({ request, locals }) {
	const { name, payload } = await request.json()

	const postData = {
		resource: 'payload/v1',
		meta: {
			name
		},
		spec: {
			name,
			payload
		}
	}

	try {
		// Save variable
		const result = await locals.api.post<Payload>(`payloads`, postData)
		return json(result)
	} catch (e) {
		console.error(e)
		return error(500, 'Could not create payload')
	}
}
