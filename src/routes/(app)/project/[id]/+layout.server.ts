import type { Project, Variable, Modifier, Trigger } from '$lib/types/resources'
import { fail } from '@sveltejs/kit'
import { getNodes } from '$lib/utils/getNodes'
import { isFlow, type Component } from '$lib/types/resources'
import type { UUID as Uuid } from 'crypto'
import type { ingressTokenModel, resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'

export async function load({ locals, params, depends }) {
	depends('project')
	const id = params.id
	if (!id) return fail(404, { message: 'Project not found' })

	const [{ data: project }, { data: modifiers }, { data: components }, { data: ingressTokens }] =
		await Promise.all([
			locals.api.get<z.infer<typeof resolvedProjectModel>>(`projects/${id}?depth=999`),
			locals.api.get<Modifier[]>(`modifiers?full=true`),
			//locals.api.get<Payload[]>(`payloads?full=true`),
			locals.api.get<Component[]>(`components?full=true`),
			locals.api.get<z.infer<typeof ingressTokenModel>[]>(`tokens/ingress`)
		])

	const payloads = { data: [] }
	const triggers = { data: [] as Trigger[] }

	const variables = modifiers.filter(m => m.resource === 'variable/v1') as Variable[]

	const positions = { data: [] }

	return {
		project,
		drafts: [],
		positions,
		components,
		modifiers,
		variables,
		payloads,
		triggers,
		ingressTokens
	}
}
