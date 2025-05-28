import type { Project, Variable } from '$lib/types/project'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/db'
import { getNodes } from '$lib/utils/getNodes'
import { inArray } from 'drizzle-orm'
import { drafts as draftsTable, nodePositions as nodePositionsTable } from '$lib/db/schema'
import { isFlow, type Component, type Uuid } from '$lib/types/agent'
import { objectMap } from '$lib/utils/objectMap'

export async function load({ locals, params, depends }) {
	depends('project')
	const id = params.id.split('/').shift()
	if (!id) return fail(404, { message: 'Project not found' })

	const [project, variables, payloads, allComponents] = await Promise.all([
		locals.api.get<Project>(`projects/${id}?depth=999`),
		locals.api.get<Variable[]>(`modifiers?full=true&type=variable`),
		locals.api.get<Variable[]>(`payloads?full=true`),
		locals.api.get<Component['meta'][]>(`components`)
	])

	// Get the drafts & positions within each flow
	const projectNodes = Object.values(project.spec.nodes).flatMap(node => [
		node.spec,
		...getNodes(node.spec)
	])
	const projectComponentIds = projectNodes.map(c => c.meta.id)
	const flows = projectNodes.filter(c => isFlow(c))
	const parentIds = [
		// include the project id as well in the parent ids to allow for top-level flows to be adjusted too
		id,
		...flows.map(f => f.meta.id)
	]

	const [drafts, allPositions] = await Promise.all([
		db.select().from(draftsTable).where(inArray(draftsTable.component_id, projectComponentIds)),
		db.select().from(nodePositionsTable).where(inArray(nodePositionsTable.parent_id, parentIds))
	])

	const positions = objectMap(
		// Group the positions by the parent flow
		Object.groupBy(allPositions, p => p.parent_id!),
		// make the positions an object like nodes instead of an array
		nodes => Object.fromEntries(nodes?.map(n => [n.node_id, { x: n.x, y: n.y }]) ?? [])
	)

	return {
		project,
		drafts: [...projectNodes.map(c => ({ component_id: c.meta.id, spec: c })), ...drafts] as {
			component_id: Uuid
			spec: Component
		}[],
		positions,
		components: allComponents,
		variables,
		payloads
	}
}

export const actions = {
	async update({ request, locals, params }) {
		const formData = await request.formData()

		const payload = await locals.api.get<Project>(`projects/${params.id}`)
		payload.meta.name = formData.get('name') as string
		payload.meta.intention.purpose = formData.get('intention') as string

		try {
			const data = await locals.api.put(`projects/${params.id}`, payload)
			return data
		} catch (error) {
			console.error(error)
			return fail(500, { message: 'Could not update project' })
		}
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
