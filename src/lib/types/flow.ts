import type * as z from 'zod'
import type { resolvedFlowModel, resolvedAgentModel, resolvedProjectModel } from '$lib/schemas'

export type NodeContainer =
	| z.infer<typeof resolvedFlowModel>
	| z.infer<typeof resolvedAgentModel>
	| z.infer<typeof resolvedProjectModel>

export type TriNode = NodeContainer['spec']['nodes'][string]
