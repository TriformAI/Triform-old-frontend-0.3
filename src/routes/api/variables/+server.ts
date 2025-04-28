import { error, json } from '@sveltejs/kit'
import type { Variable } from '$lib/types/project'

export async function POST({ request, locals }) {
	const { name, key, value } = await request.json()

	const payload = {
		resource: 'variable/v1',
		meta: {
			name
		},
		spec: {
			key,
			secret: false,
			value
		}
	}

	try {
		// Save variable
		const variable = await locals.api.post<Variable>(`modifiers`, payload)
		return json(variable)
	} catch (e) {
		console.error(e)
		return error(500, 'Could not create variable')
	}
}
