import type * as z from 'zod'
import { actionModel, ioModel, jsonSchemaTypeToPython } from '$lib/schemas'
import { objectMap } from '$lib/utils/objectMap'

export const getActionModel = (inputs: z.infer<typeof ioModel>, name = '') => {
	const convertedTypes = objectMap(inputs, value => ({
		...value,
		type: jsonSchemaTypeToPython(value.type)
	}))
	const indent = '  '
	const inputArgs = Object.entries(convertedTypes)
		.map(([key, value]) => `${indent}${key}: ${value.type}`)
		.join(', ')
		.trim()
	const inputDescriptions = Object.entries(inputs)
		.map(([key, value]) => `${indent.repeat(2)}${key}: ${value.description}`)
		.join('\n')
	const outputDescriptions = Object.entries(inputs)
		.map(([key, value]) => `${indent.repeat(2)}${key}: ${value.description}`)
		.join('\n')
	const outputModelAttributes = Object.entries(convertedTypes)
		.map(([key, value]) => `${indent}${key}: ${value.type}`)
		.join('\n')
	const outputKeys = Object.keys(convertedTypes).map(key => `${indent.repeat(2)}${key}=${key}`)

	return {
		resource: 'action/v1',
		meta: {
			name,
			intention: '',
			starred: false
		},
		spec: {
			source: `
from typing import TypedDict

@triform.output
class Output(TypedDict):
  """The output of the action.
	Attributes:
${outputDescriptions}
	"""
${outputModelAttributes}

@triform.entrypoint
def simple(${inputArgs}) -> Output:
  """A simple placeholder action.
	Args:
${inputDescriptions}
	"""
  return Output(
${outputKeys}
	)
				`.trim(),
			readme: '',
			requirements: '',
			checksum: '',
			runtime: 'python-3.13',
			// populated whenever we save the action based on the source code:
			inputs: {},
			outputs: {}
		}
	} satisfies Omit<z.infer<typeof actionModel>, 'id'>
}
