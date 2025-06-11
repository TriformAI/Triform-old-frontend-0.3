import type { Payload, Project, Variable, Modifier, Trigger } from '$lib/types/project'
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

	const [project, modifiers, payloads, allComponents] = await Promise.all([
		locals.api.get<Project>(`projects/${id}?depth=999`),
		locals.api.get<Modifier[]>(`modifiers?full=true`),
		locals.api.get<Payload[]>(`payloads?full=true`),
		locals.api.get<Component[]>(`components?full=true`)
	])

	const variables = modifiers.filter(m => m.resource === 'variable/v1') as Variable[]

	// we get all components (incl versions) for now, so we need to go through them
	// and only get the latest version for each component
	// for each componentId, find the one with the highest version
	const getLatestVersion = (components: Component[]): Component[] => {
		const grouped = Object.groupBy(components, c => c.meta.id) as Record<Uuid, Component[]>
		return Object.values(grouped).map(group =>
			group.reduce((latest, curr) => {
				const latestVersion = latest.meta.version ?? 0
				const currVersion = curr.meta.version ?? 0
				return currVersion > latestVersion ? curr : latest
			})
		)
	}
	const triggers = getLatestVersion(
		allComponents.filter(c => ['cron/v1', 'endpoint/v1'].includes(c.resource))
	) as Trigger[]
	// do the same for all components
	const latestComponents = getLatestVersion(allComponents)
	console.log(latestComponents)

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
		components: latestComponents,
		modifiers,
		variables,
		payloads,
		triggers
	}
}
