import { json, error } from '@sveltejs/kit'
import { db } from '$lib/db/index.js'
import { drafts } from '$lib/db/schema.js'
import { eq } from 'drizzle-orm'
import type { Component } from '$lib/types/resources'

export async function PATCH({ request, locals, params }) {
	if (!locals.user) return error(401, 'Unauthorized')

	const spec: Component = await request.json()

	// TODO: delete the old positions that don't exist anymore (change this to a post endpoint then probs)
	const updated = await db
		.insert(drafts)
		.values({ component_id: params.id, spec })
		.onConflictDoUpdate({
			target: drafts.component_id,
			set: {
				spec
			}
		})

	return json({ success: true, updated: updated.rowCount })
}

export async function DELETE({ request, locals, params }) {
	if (!locals.user) return error(401, 'Unauthorized')

	const updated = await db.delete(drafts).where(eq(drafts.component_id, params.id))

	return json({ success: true, updated: updated.rowCount })
}
