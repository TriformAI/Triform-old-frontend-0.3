import type { Thread } from '$lib/actions/chat'

export async function load({ locals }) {
	const { success, data: threads } = await locals.api.get<{ data: Thread[] }>('chat/threads')
	if (!success) {
    console.error('Failed to get threads')
    return { threads: [] }
  }
  return { threads }
}