import type { Thread } from '$lib/actions/chat'
import type { resolvedProjectModel } from '$lib/schemas/projects'
import type * as z from 'zod'


export async function load({ locals }) {
	let [
    { success: threadsSuccess, data: threads },
    { success: toolboxesSuccess, data: toolboxes }
  ] = await Promise.all([
    await locals.api.get<{ data: Thread[] }>('chat/threads'),
    await locals.api.get<{ data: z.infer<typeof resolvedProjectModel>[] }>('chat/toolboxes')
  ])
	if (!threadsSuccess) {
    console.error('Failed to get threads')
    threads = []
  }
  if (!toolboxesSuccess) {
    console.error('Failed to get toolboxes')
    toolboxes = []
  }
  return { threads, toolboxes }
}