import type { Project } from '$lib/types/project'
import { fail } from '@sveltejs/kit'

export async function load({ locals, params, depends }) {
	depends('project')

	const project = await locals.api.get<Project>(`projects/${params.id}?depth=999`)
	console.log(JSON.stringify(project))

	const modifiers = await locals.api.get(`modifiers?depth=999`)

	return {
		project,
		modifiers
	}
}

export const actions = {
	async update({ request, locals, params }) {
		const formData = await request.formData()

		const payload = await locals.api.get<Project>(`projects/${params.id}`)
		payload.meta.name = formData.get('name') as string
		payload.meta.intention.purpose = formData.get('intention') as string

		try {
			const data = await locals.api.put(`projects/${params.id}`, payload)
			return data
		} catch (error) {
			console.error(error)
			return fail(500, { message: 'Could not update project' })
		}
	},

	async delete() {
		// Send a delete request to the API
		console.log('delete project')

		return true
	},

	async createModifier({ request, locals }) {
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
			return data
		} catch (error) {
			console.error(error)
			return fail(500, { message: 'Could not create modifier' })
		}
	},

	async deleteModifier({ request, locals }) {
		const formData = await request.formData()
		const id = formData.get('id')
		console.log(id)

		try {
			const data = await locals.api.delete(`modifiers/${id}`)

			return data
		} catch (error) {
			console.log(error)
			return true
			//return fail(500, { message: 'Could not delete modifier' })
		}
	}
}
