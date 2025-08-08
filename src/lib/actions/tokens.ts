import { API } from '$lib/api'
import type * as z from 'zod'
import { ingressTokenModel } from '$lib/schemas/triggers'

const api = new API()

export const getIngressTokens = async () => {
	const res = await api.get<z.infer<typeof ingressTokenModel>[]>('/tokens/ingress')
	return res.data
}

const _createIngressTokenSchema = ingressTokenModel.pick({ meta: true })

export const createIngressToken = async (payload: z.infer<typeof _createIngressTokenSchema>) => {
	const res = await api.post('/tokens/ingress', payload)
	return res as { data: z.infer<typeof ingressTokenModel>; token: string }
}
