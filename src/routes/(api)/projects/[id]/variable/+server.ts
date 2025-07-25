import { json } from '@sveltejs/kit'
import type { Project } from '$lib/types/resources'

export async function POST({ request, locals, params }) {
	const { nodePath, modifierId } = await request.json()

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
			[nodePath]: [...nodeModifiers, modifierId]
		}

		// Save updated project
		await locals.api.put<Project>(`projects/${project.id}`, project)

		return json({ type: 'success' })
	} catch (error) {
		console.error(error)
		return json({ type: 'error' }, { status: 500 })
	}
}
