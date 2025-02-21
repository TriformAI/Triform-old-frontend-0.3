import { error, json, fail } from '@sveltejs/kit'

// Delete a node
export async function DELETE({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	//fail(400, { message: 'Some error' })

	return json({ success: true })
}
