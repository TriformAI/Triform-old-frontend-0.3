import type { ingressTokenModel } from '$lib/schemas/triggers'
import type * as z from 'zod'
import { page } from '$app/state'

export const ingressTokens = $state<z.infer<typeof ingressTokenModel>[]>(
	page.data.ingressTokens ?? []
)
