import { executionsResponseModel } from '$lib/schemas'
import { error } from '@sveltejs/kit'

export async function load({ locals }) {
  const {data: executions, success} = await locals.api.get<{ data: z.infer<typeof executionsResponseModel> }>('/executions')
  if (!success) {
    return error(500, 'Failed to get executions')
  }

  return { executions }
}