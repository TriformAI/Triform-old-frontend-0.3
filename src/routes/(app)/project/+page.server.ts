import { fail, redirect } from '@sveltejs/kit'
import type { Project } from '$lib/types/project'
import type { Endpoint } from '$lib/types/agent.ts'

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
					purpose: intention,
					input: '',
					output: ''
				}
			},
			spec: {
				nodes: {}
			}
		}

		// Create the project and return it
		const createdProject = await locals.api.post<Project>('projects', project)

		return createdProject
	}
}
