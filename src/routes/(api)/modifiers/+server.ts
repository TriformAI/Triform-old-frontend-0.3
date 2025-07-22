import { json } from '@sveltejs/kit'
import type { Modifier } from '$lib/types/project'

export async function POST({ request, locals }) {
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

	return json(await locals.api.post<Modifier>('modifiers', payload))
}
