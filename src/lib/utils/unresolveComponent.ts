import {
	resolvedComponentModel,
	componentModel,
	isFlow,
	isAgent,
	projectModel,
	resolvedProjectModel
} from '$lib/schemas'
import type z from 'zod'
import { objectMap } from './objectMap'

export const unresolveComponent = (
	component: z.infer<typeof resolvedComponentModel>
): z.infer<typeof componentModel> => {
	if (isFlow(component)) {
		return {
			...component,
			spec: {
				...component.spec,
				nodes: objectMap(component.spec.nodes, ({ spec: _spec, ...value }) => value)
			}
		} as z.infer<typeof componentModel>
	}

	if (isAgent(component)) {
		return {
			...component,
			spec: {
				...component.spec,
				nodes: objectMap(component.spec.nodes, ({ spec: _spec, ...value }) => value)
			}
		} as z.infer<typeof componentModel>
	}

	return component as z.infer<typeof componentModel>
}

export const unresolveProject = (
	project: z.infer<typeof resolvedProjectModel>
): z.infer<typeof projectModel> => {
	return {
		...project,
		spec: {
			...project.spec,
			nodes: objectMap(project.spec.nodes, ({ spec: _spec, ...value }) => value)
		}
	} as z.infer<typeof projectModel>
}
