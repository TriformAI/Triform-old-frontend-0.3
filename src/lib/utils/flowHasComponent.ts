import { type Component, type Flow, isFlow } from '$lib/types/agent'

export const flowHasComponent = (flow: Flow, component: Component) => {
	if (flow.meta.id === component.meta.id) return true
	for (const node of Object.values(flow.spec.nodes)) {
		// Check if it has the component as an immediate child
		if (node.component_id === component.meta.id) return true
		// If not, check recursively
		if (!isFlow(node.spec)) continue
		if (flowHasComponent(node.spec, component)) return true
	}
	return false
}
