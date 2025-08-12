import type { ioModel, resolvedAgentModel } from '$lib/schemas'
import type * as z from 'zod'

export const getAgentModel = (inputs: z.infer<typeof ioModel>) =>
	({
		resource: 'agent/v1',
		meta: {
			starred: false,
			name: 'New Agent',
			intention: ''
		},
		spec: {
			model: 'mistral/mistral-medium-latest',
			readme: 'New Agent',
			prompts: {
				system: [
					{
						type: 'template',
						value: 'You are a helpful assistant.'
					}
				],
				user: [
					{
						type: 'template',
						value: 'What is the weather in Stockholm?'
					}
				]
			},
			settings: {
				temperature: 0.2,
				topP: 0.95,
				maxTokens: 2048
			},
			nodes: {},
			outputs: {
				response: {
					description: 'The final response from the agent',
					type: {
						type: 'string'
					}
				}
			},
			inputs
		}
	}) satisfies Omit<z.infer<typeof resolvedAgentModel>, 'id'>
