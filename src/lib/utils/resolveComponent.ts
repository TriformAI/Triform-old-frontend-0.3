import { getComponent } from '$lib/actions/components'
import { componentModel, resolvedComponentModel } from '$lib/schemas'
import type * as z from 'zod'

// resolves a component (local-first) by using a cache of known components
// if it encounters a component that isn't in the cache, it'll fetch it from the api
export const resolveComponentCached = async (
	component: z.infer<typeof componentModel>,
	cache: Record<string, z.infer<typeof resolvedComponentModel>> = {}
) => {
	if ('nodes' in component.spec)
		for (const node of Object.values(component.spec.nodes) as ValueOf<
			typeof component.spec.nodes
		>[]) {
			if (node.component_id in cache) {
				// @ts-expect-error we're adding this prop
				node.spec = cache[node.component_id]
				continue
			}
			const res = await getComponent(node.component_id)
			cache[node.component_id] = res.data
			// @ts-expect-error we're adding this prop
			node.spec = res.data
		}
	return component
}
