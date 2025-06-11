import { isAction, type Component } from '$lib/types/agent'
import compare from 'just-compare'

export default function componentIsDirty(draft: Component | undefined, published: Component) {
	if (!draft) {
		return false
	}

	if (isAction(draft)) {
		return !compare(draft, published)
	}

	return !compare(draft.meta, published.meta)
}
