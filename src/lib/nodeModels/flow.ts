import type { Flow, Node as TriNode } from '$lib/types/agent'

export const getFlowModel = () => {
	return {
		component_id: crypto.randomUUID(), // so it validates
		component_version: null,
		inputs: [],
		spec: {
			resource: 'flow/v1',
			meta: {
				name: 'Flow',
				id: crypto.randomUUID(),
				intention: {
					purpose: '',
					input: '',
					output: ''
				},
				version: 1
			},
			spec: {
				readme: 'Flow',
				nodes: {},
				outputs: []
			}
		}
	} as {
		spec: Flow
	} & TriNode
}
