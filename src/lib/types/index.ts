import * as z from 'zod'
import { resolvedFlowModel } from '$lib/schemas'
import type { UUID as Uuid } from 'crypto'

export type Node = z.infer<typeof resolvedFlowModel>['spec']['nodes'][string]

export type Source = 'parent' | Uuid
