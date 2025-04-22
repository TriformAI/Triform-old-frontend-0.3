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

		// Create initial endpoint before creating project
		// We need to give this just some random IDs for now so it validates
		const initialEndpoint = await locals.api.post<Endpoint>('components', {
			resource: 'endpoint/v1',
			meta: {
				name: 'Endpoint',
				id: crypto.randomUUID(),
				version: 1
			},
			spec: {
				// gets overwritten by the backend, just needs to validate
				component_id: crypto.randomUUID(),
				component_version: 1
			}
		})

		// Need to manaually update the component id in spec for now, because the API doesn't do it
		initialEndpoint.spec.component_id = initialEndpoint.meta.id
		await locals.api.put(`components/${initialEndpoint.meta.id}`, initialEndpoint)

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
				nodes: {
					[crypto.randomUUID()]: {
						inputs: [],
						component_id: initialEndpoint.meta.id,
						component_version: 1
					}
				}
			}
		}

		// Create the project and return it
		const createdProject = await locals.api.post<Project>('projects', project)

		return createdProject
	}
}
