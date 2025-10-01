import { fail, redirect } from '@sveltejs/kit'
import type { Project } from '$lib/types/resources'

export const load = () => {
	redirect(302, '/dashboard')
}

export const actions = {
	async create({ request, locals }) {
		const formData = await request.formData()
		const name = formData.get('name') as string
		const intention = formData.get('intention') as string

		if (!name || !intention) {
			return fail(400, { message: 'Invalid input' })
		}

		const project: DeepPartial<Project> = {
			resource: 'project/v1',
			meta: {
				name,
				intention: {
					purpose: intention ?? '',
					input: '',
					output: ''
				}
			},
			spec: {
				nodes: {},
				modifiers: {}
			}
		}

		console.log(project)

		// Create the project and return it
		return await locals.api.post<Project>('projects', project)
	}
}
