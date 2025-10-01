import type { Project, Variable, Modifier, Trigger } from '$lib/types/resources'
import { fail } from '@sveltejs/kit'
import { getNodes } from '$lib/utils/getNodes'
import { isFlow, type Component } from '$lib/types/resources'
import type { UUID as Uuid } from 'crypto'
import type { deployedProjectDataModel, ingressTokenModel, resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'

export async function load({ locals, params, depends }) {
	depends('project')
	const id = params.id
	if (!id) return fail(404, { message: 'Project not found' })

	const [
		{ data: project, success: projectSuccess },
		{ data: deployments },
		{ data: modifiers },
		{ data: components },
		{ data: ingressTokens }
	] = await Promise.all([
		locals.api.get<{ data: z.infer<typeof resolvedProjectModel> }>(`projects/${id}?depth=999`),
		locals.api.get<{ data: z.infer<typeof deployedProjectDataModel>[] }>(`projects/${id}/deployments`),
		locals.api.get<{ data: Modifier[] }>(`modifiers?full=true`),
		//locals.api.get<Payload[]>(`payloads?full=true`),
		locals.api.get<{ data: Component[] }>(`components?full=true`),
		locals.api.get<{ data: z.infer<typeof ingressTokenModel>[] }>(`tokens/ingress`)
	])

	if (!projectSuccess) throw new Error('Project not found')

	console.log('project', project)

	const payloads = { data: [] }
	const triggers = { data: [] as Trigger[] }

	return {
		project,
		deployments,
		components,
		modifiers,
		payloads,
		triggers,
		ingressTokens
	}
}
