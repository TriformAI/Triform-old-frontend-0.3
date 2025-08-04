import * as z from 'zod'
import { abstractResourceModel, metaModel } from './common.js'
import { resolvedComponentModel } from './components.js'
import { modifierMappingModel } from './modifiers.js'

// expects everything to be fully resolved
export const executionModel = abstractResourceModel.extend({
	resource: z.literal('execution/v1'),
	meta: metaModel.omit({ intention: true }),
	spec: z.strictObject({
		component: resolvedComponentModel,
		payload: z.record(z.string(), z.unknown()),
		modifiers: modifierMappingModel.default({})
	})
})
