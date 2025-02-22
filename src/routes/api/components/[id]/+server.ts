import { error, json } from '@sveltejs/kit'

// Delete a node
export async function DELETE({ locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	return json({ success: true })
}
