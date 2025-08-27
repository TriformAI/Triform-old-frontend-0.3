import { source } from 'sveltekit-sse'
import { toast } from 'svelte-sonner'
import { selected } from '$lib/stores/panel.svelte'
import type { Execution } from '$lib/types/execution'
import type { Component, ResolvedComponent, ResolvedProject } from '$lib/types/resources'
import type { UUID as Uuid } from 'crypto'
import { getCurrentContainer } from '$lib/stores/canvas.svelte'
import type { executionModel, resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'
import { API } from '$lib/api'
import { executionEventModel } from '$lib/schemas'

const api = new API()

export const executeComponent = async (
	payload: Record<string, unknown>,
	component: ResolvedComponent,
	modifiers: z.infer<typeof resolvedProjectModel>['spec']['modifiers'],
	state: {
		isRunning: boolean
		state: string
		result: string
		stdout?: string
		stderr?: string
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
			modifiers,
			payload
		}
	} satisfies z.infer<typeof executionModel>

	state.state = 'Starting...'
	state.isRunning = true

	let stream = api.stream<z.infer<typeof executionEventModel>>(
		'execute/trace',
		execution,
		'POST',
		undefined,
		state.abortController.signal
	)

	try {
		for await (const event of stream) {
			console.log(event)
			if (event.event === 'running') state.state = `Running node ${event.data.path.pop()}`
			if (event.event === 'completed' && event.data.path.length === 1) {
				state.result = JSON.stringify(event.data.output, null, 2)
				state.stdout = event.data.stdout
				state.stderr = event.data.stderr
				break
			}
			if (event.event === 'failed') {
				// TODO: make this identical to what an endpoint returns, and also visualise errors in some better way
				state.result = JSON.stringify(event.data, null, 2)
				state.abortController.abort()
				state.stdout = event.data.stdout
				state.stderr = event.data.stderr
				break
			}
		}
	} catch (err) {
		console.error('Execution failed', err)
		state.state = 'Error'
		state.result =
			err && typeof err === 'object' && 'json' in err
				? JSON.stringify(await (err as any).json?.(), null, 2)
				: 'Unknown error'
	}

	state.isRunning = false
}
