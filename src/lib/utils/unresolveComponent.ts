import { resolvedComponentModel, componentModel, isFlow, isAgent } from '$lib/schemas'
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
