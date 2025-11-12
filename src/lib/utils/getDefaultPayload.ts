import { getSamplePayload } from '$lib/schemas'
import { objectMap } from './objectMap'

const objectToSchema = (obj: Record<string, { schema: unknown }>) => ({
	type: 'object',
	properties: objectMap(obj, (value, _key) => value.schema)
})

export const getDefaultPayload = (inputs: Record<string, { schema: unknown }>) =>
	JSON.stringify(getSamplePayload(objectToSchema(inputs)) ?? {}, null, 2)

