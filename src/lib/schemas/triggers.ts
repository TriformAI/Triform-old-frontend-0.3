import * as z from 'zod'
import { metaModel, triggerMetaModel } from './common.js'

// Endpoint models (without JSON path validation)
export const endpointModel = z.strictObject({
	resource: z.literal('endpoint/v1'),
	meta: triggerMetaModel,
	spec: z.strictObject({
		method: z.literal('POST'),
		payload_mapping: z.record(z.string(), z.string()),
		ingress_tokens: z.array(z.uuidv4()).default([])
	})
})

// Cron models (without cron validation)
export const cronModel = z.strictObject({
	resource: z.literal('cron/v1'),
	meta: triggerMetaModel,
	spec: z.strictObject({
		schedule: z.string(),
		timezone: z.string(),
		payload: z.record(z.string(), z.unknown())
	})
})

// Trigger union
export const triggerModel = z.discriminatedUnion('resource', [
	endpointModel,
	cronModel
])

// Ingress token models
export const ingressTokenSpecModel = z.strictObject({
	hashed_token: z.string()
})

export const ingressTokenModel = z.strictObject({
	id: z.uuidv4().optional(),
	resource: z.literal('ingress-token/v1'),
	meta: metaModel,
	spec: ingressTokenSpecModel
})