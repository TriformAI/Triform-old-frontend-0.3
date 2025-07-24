import type { Project, Variable, Modifier, Trigger } from '$lib/types/resources'
import { fail } from '@sveltejs/kit'
import { getNodes } from '$lib/utils/getNodes'
import { isFlow, type Component, type Uuid } from '$lib/types/agent'

export async function load({ locals, params, depends }) {
	depends('project')
	const id = params.id
	if (!id) return fail(404, { message: 'Project not found' })

	const [{ data: project }, { data: modifiers }, { data: components }] = await Promise.all([
		locals.api.get<Project>(`projects/${id}?depth=999`),
		locals.api.get<Modifier[]>(`modifiers?full=true`),
		//locals.api.get<Payload[]>(`payloads?full=true`),
		locals.api.get<Component[]>(`components?full=true`)
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
		triggers
	}
}
