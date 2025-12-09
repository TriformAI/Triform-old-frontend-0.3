import { API } from '$lib/api'
import type { modifierModel } from '$lib/schemas/modifiers'
import type * as z from 'zod'
import { pick } from '$lib/utils/pick'

export const getModifiers = async () => {
	const api = new API()
	return await api.get<{ data: z.infer<typeof modifierModel>[] }>('modifiers')
}

export const createModifier = async (payload: Omit<z.infer<typeof modifierModel>, 'id'>) => {
	const api = new API()
	return await api.post<{ data: z.infer<typeof modifierModel> }>('modifiers', payload)
}

export const updateModifier = async (modifier: z.infer<typeof modifierModel>) => {
	const api = new API()
	return await api.patch<{ data: z.infer<typeof modifierModel> }>(
		`modifiers/${modifier.id}`,
		pick(modifier, ['meta', 'spec'])
	)
}

export const deleteModifier = async (id: string) => {
	const api = new API()
	return await api.delete<{ data: z.infer<typeof modifierModel> }>(`modifiers/${id}`)
}

export const decryptModifier = async <T extends z.infer<typeof modifierModel>>(modifier: T) => {
	type ReturnType = T extends { resource: 'sql/v1' } ? { uri: string } : Record<string, never>
	const api = new API()
	return await api.get<{data: ReturnType}>(`modifiers/${modifier.id}/decrypt`)
}