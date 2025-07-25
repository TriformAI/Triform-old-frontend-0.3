import type { Project } from '$lib/types/resources'
import { fail } from '@sveltejs/kit'

export const actions = {
	async update({ request, locals, params }) {
		const formData = await request.formData()
		const { data } = await locals.api.get<Project>(`projects/${params.id}`)

		const payload = {
			resource: data.resource,
			meta: {
				intention: data.meta.intention,
				name: formData.get('name') as string
			},
			spec: data.spec
		}

		payload.meta.intention.purpose = formData.get('intention') as string

		return await locals.api.put<Project>(`projects/${params.id}`, payload)
	},

	async delete({ request, locals, params }) {
		// Send a delete request to the API
		try {
			const data = await locals.api.delete<Project>(`projects/${params.id}`)
			return data
		} catch (error) {
			console.error(error)
			return fail(500, { message: 'Could not delete project' })
		}
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
