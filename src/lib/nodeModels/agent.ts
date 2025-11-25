import type { ioModel, resolvedAgentModel } from '$lib/schemas'
import type * as z from 'zod'

export const getAgentModel = (inputs: z.infer<typeof ioModel>, name = '') =>
	({
		resource: 'agent/v1',
		meta: {
			starred: false,
			name,
			intention: ''
		},
		spec: {
			model: 'mistral-medium-latest',
			readme: 'New Agent',
			prompts: {
				system: [
					{
						type: 'template',
						value: 'You are a helpful assistant.',
						enabled: true
					}
				],
				user: [
					{
						type: 'template',
						value: '',
						enabled: false
					}
				]
			},
			settings: {
				temperature: 0.2,
				topP: 0.95,
				maxTokens: 32768
			},
			nodes: {},
			outputs: {
				response: {
					description: 'The final response from the agent',
					schema: {
						type: 'string'
					}
				}
			},
			inputs
		}
	}) satisfies Omit<z.infer<typeof resolvedAgentModel>, 'id'>
