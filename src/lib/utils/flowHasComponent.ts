import { type Component, type Flow, isFlow } from '$lib/types/resources'

export const flowHasComponent = (flow: Flow, component: Component) => {
	if (flow.id === component.id) return true
	for (const node of Object.values(flow.spec.nodes)) {
		// Check if it has the component as an immediate child
		if (node.component_id === component.id) return true
		// If not, check recursively
		if (!isFlow(node.spec)) continue
		if (flowHasComponent(node.spec, component)) return true
	}
	return false
}
