import { API } from '$lib/api'
import type * as z from 'zod'
import { ingressTokenModel } from '$lib/schemas/triggers'

const api = new API()

export const getIngressTokens = async () => {
	return await api.get<{ data: z.infer<typeof ingressTokenModel>[] }>('/tokens/ingress')
}

const _createIngressTokenSchema = ingressTokenModel.pick({ meta: true })

export const createIngressToken = async (payload: z.infer<typeof _createIngressTokenSchema>) => {
    // API returns both the created token resource (data) and the one-time plaintext token (token)
    return await api.post<{ data: z.infer<typeof ingressTokenModel>; token: string }>(
        '/tokens/ingress',
        payload
    )
}
