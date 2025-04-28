import { json, error } from '@sveltejs/kit'
import type { Project } from '$lib/types/project'
import { saveProject } from '$lib/actions/project'

export async function DELETE({ request, locals, params, url }) {
	const nodePath = url.searchParams.get('nodePath')!

	try {
		// Fetch current project
		const project = await locals.api.get<Project>(`projects/${params.id}?depth=999`)

		// All modifiers for the user
		const allModifiers = project.spec.modifiers ?? {}

		// All modifiers for the current node
		const nodeModifiers = allModifiers[nodePath] ?? []

		// Add new variable to node modifiers
		project.spec.modifiers = {
			...allModifiers,
			[nodePath]: nodeModifiers.filter(id => id !== params.var_id)
		}

		// Save updated project
		await saveProject(project)

		return json({ type: 'success' })
	} catch (err) {
		console.error(err)
		return error(500, 'Could not detach variable')
	}
}
