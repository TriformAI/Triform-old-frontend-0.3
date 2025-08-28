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
						value: ''
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
				messages: {
					description: 'The messages from the agent',
					type: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								role: { type: 'string' },
								content: { type: 'string' }
							}
						}
					}
				},
				response: {
					description: 'The final response from the agent',
					type: {
						type: 'string'
					}
				}
			},
			inputs: {
				...inputs,
				messages: {
					description: 'Optional message history to seed the agent',
					type: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								role: { type: 'string' },
								content: { type: 'string' }
							}
						}
					}
				}
			}
		}
	}) satisfies Omit<z.infer<typeof resolvedAgentModel>, 'id'>
