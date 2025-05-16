import { error } from '@sveltejs/kit'
import { type Component } from '$lib/types/agent'
import { type ServerSentEventMessage } from 'fetch-event-stream'
import { produce } from 'sveltekit-sse'

export async function POST({ request, locals }) {
	if (!locals.user) return error(401, 'Unauthorized')

	const component: Component = await request.json()

	console.log('building component', component)
	let emitter
	try {
		emitter = await locals.api.stream('builder/tasks/', 'POST', component)
	} catch (e) {
		console.error('failed to start build stream', e)
		// Normally we'd return an error() or something here
		// but the SSE library we're using in the frontend doesn't allow
		// for catching such errors in any nice way, so instead we'll just
		// return a stream and send just an error event
		return produce(async function start({ emit, lock }) {
			if (e instanceof Error) {
				emit('error', e.message)
			} else {
				emit('error', 'Failed to start build stream')
			}
			lock.set(false)
		})
	}

	console.log('got emitter', emitter)

	return produce(async function start({ emit, lock }) {
		const msgHandler = (evt: Event) => {
			const msg = evt as CustomEvent<ServerSentEventMessage>
			console.log('got builder', msg.detail.event, msg.detail.data)
			emit(msg.detail.event!, msg.detail.data!)
		}
		emitter.addEventListener('message', msgHandler)
		// Wait for build to finish
		await new Promise(resolve => emitter.addEventListener('close', resolve))
		// Stop stream
		emit('close', 'finished')
		lock.set(false)
		return function cancel() {
			// Clean up
			console.debug('Cleaning up stream')
			emitter.removeEventListener('message', msgHandler)
		}
	})
}
