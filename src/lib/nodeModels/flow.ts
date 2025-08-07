import type { resolvedFlowModel } from '$lib/schemas'
import type * as z from 'zod'

export const getFlowModel = () =>
	({
		resource: 'flow/v1',
		meta: {
			starred: false,
			name: 'New Flow',
			intention: ''
		},
		spec: {
			readme: 'New Flow',
			nodes: {},
			outputs: {},
			inputs: {},
			io_nodes: {
				input: { x: 0, y: 0 },
				output: { x: 0, y: 100 }
			}
		}
	}) satisfies Omit<z.infer<typeof resolvedFlowModel>, 'id'>
