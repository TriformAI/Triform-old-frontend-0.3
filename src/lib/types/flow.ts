import type * as z from 'zod'
import type { resolvedFlowModel, resolvedAgentModel, resolvedProjectModel } from '$lib/schemas'

export type FlowContainer =
	| z.infer<typeof resolvedFlowModel>
	| z.infer<typeof resolvedAgentModel>
	| z.infer<typeof resolvedProjectModel>
