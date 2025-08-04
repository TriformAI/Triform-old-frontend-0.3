import * as z from 'zod'
import { metaModel, nodePathModel } from './common.js'

// Variable models
export const variableSpecModel = z.strictObject({
	key: z.string(),
	value: z.string(),
	secret: z.literal(false) // can only be false for now
})

export const variableModel = z.strictObject({
	id: z.uuidv4().optional(),
	resource: z.literal('variable/v1'),
	meta: metaModel,
	spec: variableSpecModel
})

// Modifier union models
export const modifierSpecModel = z.union([variableSpecModel])
export const modifierModel = z.discriminatedUnion('resource', [variableModel])

// Basic modifier mapping without async validation
export const modifierMappingModel = z.record(
	nodePathModel,
	z.array(
		z.strictObject({
			modifier_id: z.uuidv4(),
			spec: modifierModel
		})
	)
)

export const modifierResourceModel = z.enum(
	modifierModel.options.map(o => o.shape.resource.value)
)