import type { ExecutionTraceData } from '$lib/types/execution'
import { source } from 'sveltekit-sse'
import { toast } from 'svelte-sonner'
import { selected } from '$lib/stores/panel.svelte'
import type { Execution } from '$lib/types/execution'
import type { Component, ResolvedComponent } from '$lib/types/resources'
import type { UUID as Uuid } from 'crypto'
import { getCurrentContainer } from '$lib/stores/canvas.svelte'
import type { executionModel } from '$lib/schemas'
import type * as z from 'zod'
import { API } from '$lib/api'
import { executionEventModel } from '$lib/schemas'

const api = new API()

export const executeComponent = async (
	payload: Record<string, unknown>,
	component: ResolvedComponent,
	state: {
		isRunning: boolean
		state: string
		result: string
		abortController: AbortController
	}
) => {
	const execution = {
		resource: 'execution/v1',
		meta: {
			name: ''
		},
		spec: {
			component,
			modifiers: {},
			payload
		}
	} satisfies z.infer<typeof executionModel>

	state.state = 'Starting...'
	state.isRunning = true

	let stream
	try {
		stream = api.stream<z.infer<typeof executionEventModel>>(
			'execute/trace',
			execution,
			'POST',
			undefined,
			state.abortController.signal
		)
	} catch (e) {
		console.error(e)
		state.state = 'Error'
		state.result = JSON.stringify(e, null, 2)
		state.isRunning = false
		return
	}

	for await (const event of stream) {
		console.log(event)
		if (event.event === 'running') state.state = `Running node ${event.data.path.pop()}`
		if (event.event === 'completed' && event.data.path.length === 1) {
			state.result = JSON.stringify(event.data.output, null, 2)
			break
		}
	}

	state.isRunning = false
}
