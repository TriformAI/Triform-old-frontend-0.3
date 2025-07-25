import { isFlow, isAction, type Component } from '$lib/types/resources'
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
	// ignore checksum for actions
	else if (isAction(d) && isAction(p))
		return !compareEq(
			{
				...d,
				spec: {
					...d.spec,
					checksum: undefined
				}
			},
			{
				...p,
				spec: {
					...p.spec,
					checksum: undefined
				}
			}
		)

	return !compareEq(d, p)
}
