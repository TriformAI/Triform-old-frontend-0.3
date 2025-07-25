import type { Node as TriNode } from '$lib/types'

export const getActionModel = (): TriNode => {
	return {
		component_id: crypto.randomUUID(), // so it validates
		inputs: {},
		spec: {
			id: crypto.randomUUID(),
			resource: 'action/v1',
			meta: {
				starred: false,
				name: 'Action',
				intention: {
					purpose: '',
					input: '',
					output: ''
				}
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
				requirements: '',
				checksum: '',
				runtime: 'python-3.14'
			}
		}
	}
}
