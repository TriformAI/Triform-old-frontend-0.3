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
				// leave sampling params unset so each model uses its own default —
				// opt in per agent under Advanced settings. Setting both temperature and
				// topP here is rejected outright by some models (eg Bedrock Claude).
				temperature: null,
				topP: null,
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
