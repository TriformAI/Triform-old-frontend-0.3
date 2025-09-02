import type { resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'

export const ssr = false

export async function load({ locals }) {
	const { data: projects } = await locals.api.get<z.infer<typeof resolvedProjectModel>[]>('projects')

	return {
		projects
	}
}
