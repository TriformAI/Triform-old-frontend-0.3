import type { ResolvedFlow } from './resources'
import type { UUID as Uuid } from 'crypto'

export type Node = ResolvedFlow['spec']['nodes'][string]

export type Source = 'parent' | Uuid
