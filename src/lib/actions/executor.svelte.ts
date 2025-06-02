import type { ExecutionTraceData } from '$lib/types/execution'
import { source } from 'sveltekit-sse'
import { getCurrentFlowId } from '$lib/stores/canvas.svelte'
import { toast } from 'svelte-sonner'
import { selected } from '$lib/stores/panel.svelte'
import type { Execution } from '$lib/types/execution'
import type { Component } from '$lib/types/agent'
import type { Uuid } from '$lib/types/agent'

export const executor = $state({
	isRunning: false,
	state: '',
	result: ''
})

const createExecution = (
	nodeId: Uuid,
	input: Record<string, unknown>,
	spec: Component
): Execution => {
	console.log('creating execution', nodeId, input, spec)
	const execution = {
		resource: 'execution/v1',
		input,
		spec: {
			spec,
			// Dummy data just for the backend to validate
			component_id: crypto.randomUUID(),
			component_version: 1
		}
	} satisfies Execution

	return execution
}

export const executeComponent = async (payload: string, componentData: Component) => {
	const nodeId = selected.node?.id ?? getCurrentFlowId()

	if (!nodeId) {
		return toast.error('No node selected')
	}

	executor.isRunning = true

	const execution = createExecution(nodeId, JSON.parse(payload), componentData)
	console.log('creating execution', execution)

	let stream: ReturnType<typeof source> | undefined = undefined

	try {
		stream = source(`/api/executions`, {
			options: {
				body: JSON.stringify(execution),
				method: 'POST',
				credentials: 'include'
			},
			error: err => {
				throw err
			},
			cache: false
		})
		console.log('stream', stream)
		executor.state = 'Starting execution'

		const extractErrorMessage = (msg: string): string => {
			let data: ExecutionTraceData
			try {
				data = JSON.parse(msg as unknown as string)
			} catch (e) {
				console.error('Failed to parse error message', e)
				return ''
			}
			if (!('error' in data.payload)) return ''
			return typeof data.payload.error === 'string'
				? data.payload.error
				: JSON.stringify(data.payload.error, null, 2)
		}

		// Define event handlers
		const eventHandlers = {
			close: msg => {
				if (msg === 'finished') {
					console.log('finished')
					executor.isRunning = false
					stream?.close()
					stream = undefined
				}
			},
			error: msg => {
				executor.isRunning = false
				toast.error('Error executing component')
				let parsedMsg: Record<string, unknown>
				try {
					parsedMsg = JSON.parse(msg as unknown as string)
				} catch (e) {
					console.error('Failed to parse error message', e)
					return
				}
				console.error('Error executing component', parsedMsg.error ?? parsedMsg)
			},
			action_started: msg => {
				let data: ExecutionTraceData
				try {
					data = JSON.parse(msg as unknown as string)
				} catch (e) {
					console.error('Failed to parse execution trace data', e)
					return
				}
				if (!('result' in data.payload)) return
				console.log('starting action')
			},
			execution_completed: msg => {
				console.log('got execution_completed', msg)
				let data: ExecutionTraceData
				try {
					data = JSON.parse(msg as unknown as string)
				} catch (e) {
					console.error('Failed to parse execution trace data', e)
					return
				}
				if (!('result' in data.payload)) return
				let res: unknown
				// If we executed just one action, use the result from just that one
				if (data.payload.result && Object.keys(data.payload.result).length === 1) {
					res = Object.values(data.payload.result)[0]
				} else {
					// Otherwise, show all results for now
					res = data.payload.result
				}
				executor.result = typeof res === 'string' ? res : JSON.stringify(res, null, 2)
				console.log(executor.result)
			},
			action_failed: msg => {
				// TODO: highlight the node that failed
				executor.isRunning = false
				toast.error('Action failed')
				executor.result = extractErrorMessage(msg)
			},
			execution_failed: msg => {
				executor.isRunning = false
				toast.error('Execution failed')
				executor.result = extractErrorMessage(msg)
			}
		} as Record<string, (msg: string) => void>
		// Subscribe to the events above
		for (const [event, handler] of Object.entries(eventHandlers))
			stream.select(event).subscribe(msg => {
				if (!msg) return
				console.log('got event', event)
				if (!['close', 'ping'].includes(event)) {
					executor.state = event
				}
				return handler(msg)
			})
	} catch (e) {
		console.error('Failed executing component', e)
		toast.error('There was an error executing the component')
		executor.isRunning = false
	}
}
