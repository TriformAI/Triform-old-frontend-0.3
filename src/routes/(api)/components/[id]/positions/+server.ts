import { json, error } from '@sveltejs/kit'
import { db } from '$lib/db/index.js'
import { nodePositions } from '$lib/db/schema.js'
import type { UUID as Uuid } from 'crypto'
import { sql } from 'drizzle-orm'

export async function PATCH({ request, locals }) {
	if (!locals.user) return error(401, 'Unauthorized')

	const {
		id,
		positions
	}: {
		id: Uuid
		positions: Record<Uuid, { x: number; y: number }>
	} = await request.json()

	if (!Object.keys(positions ?? {}).length) return json({ success: true, updated: 0 })

	console.log('updating positions', id, positions)

	// TODO: delete the old positions that don't exist anymore (change this to a post endpoint then probs)
	const updated = await db
		.insert(nodePositions)
		.values(
			Object.entries(positions).map(([node_id, { x, y }]) => ({
				parent_id: id,
				node_id,
				x: Math.round(x),
				y: Math.round(y)
			}))
		)
		.onConflictDoUpdate({
			target: [nodePositions.parent_id, nodePositions.node_id],
			set: {
				x: sql`excluded.x`,
				y: sql`excluded.y`
			}
		})

	return json({ success: true, updated: updated.rowCount })
}
