import type {
	Payload,
	Project,
	Variable,
	Modifier,
	Trigger,
	Cron,
	Endpoint
} from '$lib/types/project'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/db'
import { getNodes } from '$lib/utils/getNodes'
import { inArray } from 'drizzle-orm'
import { drafts as draftsTable, nodePositions as nodePositionsTable } from '$lib/db/schema'
import { isFlow, type Component, type Uuid } from '$lib/types/agent'
import { objectMap } from '$lib/utils/objectMap'

export async function load({ locals, params, depends }) {
	depends('project')
	const id = params.id
	if (!id) return fail(404, { message: 'Project not found' })

	const [project, modifiers, payloads, allComponents, crons, endpoints] = await Promise.all([
		locals.api.get<Project>(`projects/${id}?depth=999`),
		locals.api.get<Modifier[]>(`modifiers?full=true`),
		locals.api.get<Payload[]>(`payloads?full=true`),
		locals.api.get<Component['meta'][]>(`components`),
		locals.api.get<Cron[]>(`components?type=cron&full=true`),
		locals.api.get<Endpoint[]>(`components?type=endpoint&full=true`)
	])

	const variables = modifiers.filter(m => m.resource === 'variable/v1') as Variable[]

	const allTriggers = [...crons, ...endpoints] as Trigger[]
	// we get all components (incl versions) for now, so we need to go through them
	// and only get the latest version for each component
	// for each componentId, find the one with the highest version
	const triggers = Object.values(
		Object.groupBy(allTriggers, trigger => trigger.meta.id as string)
	).map(triggerVersions =>
		triggerVersions!.reduce((highest, current) =>
			(current.meta.version as number) > (highest.meta.version as number) ? current : highest
		)
	)

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
		modifiers,
		variables,
		payloads,
		triggers
	}
}
