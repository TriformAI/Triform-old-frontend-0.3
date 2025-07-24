//import type { Node as TriNode } from '$lib/types/agent'
import type { Flow } from '$lib/types/resources'

export const getFlowModel = () => {
	return {
		resource: 'flow/v1',
		meta: {
			starred: false,
			name: 'Flow',
			intention: {
				purpose: '',
				input: '',
				output: ''
			}
		},
		spec: {
			readme: 'Flow',
			nodes: {},
			outputs: {},
			inputs: {}
		}
	}
}
