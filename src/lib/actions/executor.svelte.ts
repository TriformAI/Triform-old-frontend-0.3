import type { executionModel, projectModel, resolvedComponentModel, resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'
import { API } from '$lib/api'
import { executionEventModel } from '$lib/schemas'
import { resetExecutionState, setNodeExecutionState, setActiveExecutionId, getExecutionNodeStates, getNodeExecutionState } from '$lib/stores/execution.svelte'
import { getNodeByPath } from '$lib/stores/canvas.svelte'
import type { TriNode } from '$lib/types/flow'

const api = new API()

type ResolvedComponent = z.infer<typeof resolvedComponentModel>

export const executeComponent = async (
	payload: Record<string, unknown>,
	component: ResolvedComponent,
	modifiers: z.infer<typeof projectModel>['spec']['modifiers'],
	environment: z.infer<typeof resolvedProjectModel>['spec']['environment'],
	state: {
		isRunning: boolean
		state: string
		result: string
		stdout?: string
		stderr?: string
		abortController: AbortController
		id: string
	},
	rootNodeId?: string
) => {
	const execution = {
		resource: 'execution/v1',
		meta: {
			name: ''
		},
		spec: {
			component,
			modifiers,
			payload,
			environment
		}
	} satisfies z.infer<typeof executionModel>

	state.state = 'Starting...'
	state.isRunning = true
	state.id = ''

	let stream = api.socketStream<z.infer<typeof executionEventModel>>(
		'execute/trace/ws',
		execution,
		undefined,
		state.abortController.signal
	)

	try {
		resetExecutionState()
		for await (const event of stream) {
			// not a node-event, but rather an actual error in the payload or something
			if (event.event === 'error') {
				state.state = 'Error'
				state.result = JSON.stringify(event.data, null, 2)
				state.abortController.abort()
				resetExecutionState()
				state.isRunning = false
				return
			}
			if (!state.id) {
				state.id = event.data.path[0]
				setActiveExecutionId(state.id)
			}
			if (rootNodeId) setNodeExecutionState(state.id, rootNodeId, { state: 'running' as const, input: event.data.payload })

			// : is other metadata such as the call id (in case the same tool is called multiple times) or loop index (in case of a loop)
			const nodeId = event.data.path.at(-1)?.split(':')?.[0]
			const nodePath = [...event.data.path].map(p => p.split(':')[0]).slice(1) // remove execution id (first)
			const node: TriNode | undefined =
				'nodes' in component.spec ? getNodeByPath(nodePath, component.spec.nodes) : undefined
			const comp = node?.spec ?? component
			const {payload: input, ...data} = event.data
			const eventState = event.event as 'running' | 'completed' | 'failed'

			if (nodeId && eventState) setNodeExecutionState(state.id, nodeId, { state: eventState, input, ...data })
			if (eventState === 'running') state.state = `Executing ${comp.meta.name}`
			else if (eventState === 'completed' && event.data.path.length === 1) {
				state.state = `Completed ${comp.meta.name}`
				state.result = JSON.stringify(event.data.output, null, 2)
				state.stdout = event.data.stdout
				state.stderr = event.data.stderr
				break
			} else if (eventState === 'failed' && !event.data.path.some(p => p.split(':').pop()?.startsWith('tool_'))) {
				// TODO: make this identical to what an endpoint returns, and also visualise errors in some better way
				state.result = JSON.stringify(event.data, null, 2)
				state.abortController.abort()
				state.stdout = event.data.stdout
				state.stderr = event.data.stderr
				// clear all the other running nodes
				const executionNodeStates = getExecutionNodeStates()
				for (const executionId in executionNodeStates) {
					for (const nodeId in executionNodeStates[executionId].nodes) {
						const state = executionNodeStates[executionId].nodes[nodeId]
						if (state?.state === 'running') delete executionNodeStates[executionId]?.nodes?.[nodeId]
					}
				}
				break
			}
		}
		if (rootNodeId) setNodeExecutionState(state.id, rootNodeId, {
			state: 'completed' as const,
			input: payload,
			output: typeof state.result === 'string' ? JSON.parse(state.result) : state.result,
			stdout: state.stdout,
			stderr: state.stderr
		})
	} catch (err) {
		console.error('Execution failed', err)
		state.state = 'Error'
		state.result =
			err && typeof err === 'object' && 'json' in err
				? JSON.stringify(await (err as any).json?.(), null, 2)
				: 'Unknown error'
		resetExecutionState()
	}

	state.isRunning = false
}

export const cancelExecution = async (id: string) => await api.post('execute/cancel', { id })