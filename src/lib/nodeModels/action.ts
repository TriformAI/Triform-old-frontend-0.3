import type { Node as TriNode } from '$lib/types/agent'

export const getActionModel = () => {
	return {
		component_id: crypto.randomUUID(), // so it validates
		component_version: null,
		inputs: [],
		spec: {
			resource: 'action/v1',
			meta: {
				name: 'Action',
				id: crypto.randomUUID(),
				version: 1
			},
			spec: {
				source: `
from pydantic import BaseModel
    
class Model(BaseModel):
	msg: str

@triform.entrypoint
def simple(input: Model) -> Model:
	return input
            `.trim(),
				readme: '',
				deps: '',
				streaming: false
			}
		}
	} as TriNode
}
