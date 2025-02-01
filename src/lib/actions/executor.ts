import { updateAction } from '$lib/stores/canvas.svelte'
import type { Action, Agent } from '$lib/types/agent'

export const publishAction = async (action: Action) => {
	console.log('publishing action', action)
	const res = await fetch('https://triform.arcticmarinesolutions.se/v1/action', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(action.spec)
	})
	const newSpec = await res.json()
	console.log(newSpec)
	// The return value from the api doesn't include the key, so we
	// need to add the key from the current action
	return await updateAction(
		Object.assign(action, {
			id: newSpec.id,
			spec: {
				...action.spec,
				...newSpec
			}
		})
	)
}

export const runAgent = async (fullAgent: Agent, input: unknown) => {
	// const agent = JSON.parse(JSON.stringify(fullAgent))
	// // Remove the spec of all actions
	// await new Promise<ResourceV1>(resolve =>
	// 	processResource(agent, (resource: ActionResource) => delete resource.spec, resolve)
	// )
	// // Construct the actual invocation request
	// const invocation = {
	// 	resource: 'invocation',
	// 	api_version: 'v1',
	// 	input,
	// 	turbo: true,
	// 	spec: agent
	// }
	// console.log('running agent', invocation)
	// const res = await fetch('https://triform.arcticmarinesolutions.se/v1/run', {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify(invocation)
	// })
	// return await res.json()
}
