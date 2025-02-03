import type {
	Agent,
	Component
} from '$lib/types/agent'

const baseUrl = `${import.meta.env.VITE_TRICORE_URL}/v1`

export const publishComponent = async (component: Component) => {
	console.log('publishing component', component)
	const res = await fetch(`${baseUrl}/component/publish/${component.meta.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(component)
	})
	const updatedComponent = await res.json()
	console.log('published component', updatedComponent)
	return updatedComponent
}

export const saveComponent = async (component: Component) => {
	
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
