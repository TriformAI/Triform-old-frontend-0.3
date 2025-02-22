import type { Component } from '$lib/types/agent'
import type { Execution, ExecutionTraceEvent } from '$lib/types/execution'
import type { ServerSentEventMessage } from 'fetch-event-stream'

import { error } from '@sveltejs/kit'
import { produce } from 'sveltekit-sse'

// Execute a component
export async function POST({ request, locals }) {
	if (!locals.user) {
		return error(401, 'Unauthorized')
	}

	interface Payload {
		input: Record<string, unknown>
		component: Component
	}

	const { input, component }: Payload = await request.json()

	const execution: Execution = {
		resource: 'execution/v1',
		input,
		spec: {
			component_id: component.meta.id,
			component_version: component.meta.version
		}
	}

	console.log('executing component with trace', component, execution)
	const emitter = await locals.api.stream('trace', 'POST', execution)

	console.log('got emitter', emitter)

	return produce(async function start({ emit, lock }) {
		const msgHandler = (evt: Event) => {
			const msg = evt as CustomEvent<ServerSentEventMessage>
			emit(
				msg.detail.event as ExecutionTraceEvent,
				msg.detail.data! // ExecutionTraceData stringified
			)
		}
		emitter.addEventListener('message', msgHandler)
		// Wait for trace to finish
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
