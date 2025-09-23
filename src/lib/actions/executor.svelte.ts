import { source } from 'sveltekit-sse'
import { toast } from 'svelte-sonner'
import { selected } from '$lib/stores/panel.svelte'
import type { Execution } from '$lib/types/execution'
import type { UUID as Uuid } from 'crypto'
import { getCurrentContainer } from '$lib/stores/canvas.svelte'
import type { executionModel, resolvedComponentModel, resolvedProjectModel } from '$lib/schemas'
import type * as z from 'zod'
import { API } from '$lib/api'
import { executionEventModel } from '$lib/schemas'
import { resetExecutionState, setNodeExecutionState } from '$lib/stores/execution.svelte'
import { getNodeByPath } from '$lib/stores/canvas.svelte'
import type { TriNode } from '$lib/types/flow'

const api = new API()

type ResolvedComponent = z.infer<typeof resolvedComponentModel>

export const executeComponent = async (
	payload: Record<string, unknown>,
	component: ResolvedComponent,
	modifiers: z.infer<typeof resolvedProjectModel>['spec']['modifiers'],
	environment: z.infer<typeof resolvedProjectModel>['spec']['environment'],
	state: {
		isRunning: boolean
		state: string
		result: string
		stdout?: string
		stderr?: string
		abortController: AbortController
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

	let stream = api.stream<z.infer<typeof executionEventModel>>(
		'execute/trace',
		execution,
		'POST',
		undefined,
		state.abortController.signal
	)

	try {
		resetExecutionState()
		let executionId = ''
		for await (const event of stream) {
			console.log(event)
			executionId = event.data.path[0]
			if (rootNodeId) setNodeExecutionState(executionId, rootNodeId, { state: 'running' })
			// : is other metadata such as the call id (in case the same tool is called multiple times) or loop index (in case of a loop)
			const nodeId = event.data.path.at(-1)?.split(':')?.[0]
			const nodePath = [...event.data.path].map(p => p.split(':')[0]).slice(1) // remove execution id (first)
			const node: TriNode | undefined =
				'nodes' in component.spec ? getNodeByPath(nodePath, component.spec.nodes) : undefined
			const comp = node?.spec ?? component
			if (nodeId && event.event) setNodeExecutionState(executionId, nodeId, { state: event.event })
			if (event.event === 'running') state.state = `Executing ${comp.meta.name}`
			if (event.event === 'completed' && event.data.path.length === 1) {
				state.state = `Completed ${comp.meta.name}`
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
		if (rootNodeId) setNodeExecutionState(executionId, rootNodeId, { state: 'completed' })
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
