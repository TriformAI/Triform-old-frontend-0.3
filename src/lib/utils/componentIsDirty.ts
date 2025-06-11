import { isFlow, type Component } from '$lib/types/agent'
import compareEq from 'just-compare'

export default function componentIsDirty(draft: Component | undefined, published: Component) {
	if (!draft) {
		return false
	}

	const removeVersion = (component: Component) => ({
		...component,
		meta: {
			...component.meta,
			version: undefined
		}
	})

	const d = removeVersion(draft)
	const p = removeVersion(published)

	if (isFlow(draft)) return !compareEq(d.meta, p.meta)

	return !compareEq(d, p)
}
