import { json } from '@sveltejs/kit'
import type { Modifier } from '$lib/types/resources'

export async function PUT({ request, locals, params }) {
	let payload = await request.json()

	// purpose is required for validation for now (will be dropped later)
	payload = Object.assign(payload ?? {}, {
		meta: {
			...(payload.meta ?? {}),
			intention: {
				purpose: ''
			}
		}
	})

	// AGAIN, same as above, we need to add a component uuid to crons
	// will be removed once backend does their thing...
	if (payload.resource === 'cron/v1') {
		payload.spec.component_id = crypto.randomUUID()
	}

	return json(await locals.api.put<Modifier>(`modifiers/${params.id}`, payload))
}

export async function DELETE({ locals, params }) {
	return json(await locals.api.delete(`modifiers/${params.id}`))
}
