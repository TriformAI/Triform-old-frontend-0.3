import { json } from '@sveltejs/kit'

export async function POST({ request, locals }) {
	const formData = await request.formData()
	const name = formData.get('name') as string
	const intention = formData.get('intention') as string
	const keys = formData.getAll('key[]')
	const values = formData.getAll('value[]')

	const env = Object.fromEntries(keys.map((key, idx) => [key, values[idx]]))

	const payload = {
		resource: 'variables/v1',
		meta: {
			id: crypto.randomUUID(),
			name,
			intention: {
				purpose: intention,
				input: '',
				output: ''
			}
		},
		spec: {
			env
		}
	}

	try {
		const data = await locals.api.post(`modifiers`, payload)
		return json({ type: 'success' })
	} catch (error) {
		console.error(error)
		return json({ type: 'error' }, { status: 500 })
	}
}
