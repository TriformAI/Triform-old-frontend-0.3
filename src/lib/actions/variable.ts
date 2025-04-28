import { API } from '$lib/api'
import type { Variable } from '$lib/types/project'

const api = new API()

interface Params {
	name: string
	key: string
	value: {
		dev: string
		stage: string
		prod: string
	}
}

export const createVariable = async ({ name, key, value }: Params) => {
	const payload = {
		resource: 'variable/v1',
		meta: {
			name
		},
		spec: {
			key,
			secret: false,
			value
		}
	}

	return await api.post<Variable>(`modifiers`, payload)
}
