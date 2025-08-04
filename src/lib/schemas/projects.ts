import * as z from 'zod'
import { metaModel, nodePathModel } from './common.js'
import { resolvedComponentModel } from './components.js'
import { modifierMappingModel } from './modifiers.js'
import { triggerModel } from './triggers.js'

// Project models (without async validations)
export const projectSpecModel = z.strictObject({
	readme: z.string().optional().default(''),
	nodes: z.record(
		z.string(),
		z.strictObject({
			component_id: z.uuidv4(),
			triggers: z.record(z.string(), triggerModel).default({}),
			order: z.number().default(0)
		})
	),
	modifiers: z
		.record(
			nodePathModel,
			z.array(
				z.strictObject({
					modifier_id: z.uuidv4()
				})
			)
		)
		.default({})
})

export const resolvedProjectSpecModel = projectSpecModel.extend({
	nodes: z
		.record(
			z.string(),
			z.strictObject({
				component_id: z.uuidv4(),
				spec: resolvedComponentModel,
				triggers: z.record(z.string(), triggerModel).default({}),
				order: z.number().default(0)
			})
		)
		.default({}),
	modifiers: modifierMappingModel.default({})
})

export const projectModel = z.strictObject({
	id: z.uuidv4().optional(),
	resource: z.literal('project/v1'),
	meta: metaModel.omit({ intention: true }),
	spec: projectSpecModel
})

export const resolvedProjectModel = projectModel.extend({
	spec: resolvedProjectSpecModel
})