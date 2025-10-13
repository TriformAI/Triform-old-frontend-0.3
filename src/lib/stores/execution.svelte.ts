import { executionEventModel } from '$lib/schemas'
import type * as z from 'zod'

export interface ExecutionNodeState {
	state: z.infer<typeof executionEventModel>['event'],
	input?: z.infer<typeof executionEventModel>['payload'],
	output?: z.infer<typeof executionEventModel>['output'],
	stdout?: z.infer<typeof executionEventModel>['stdout'],
	stderr?: z.infer<typeof executionEventModel>['stderr'],
	stacktrace?: z.infer<typeof executionEventModel>['stacktrace']
}

const executionNodeStates = $state<Record<string, { nodes: Record<string, ExecutionNodeState> }>>(
	{}
)
export const getExecutionNodeStates = () => executionNodeStates

let activeExecutionId = $state<string | undefined>(undefined)

export const getNodeExecutionState = (nodeId: string) =>
	Object.values(executionNodeStates).find(s => s.nodes && nodeId in s.nodes)?.nodes[nodeId]

export const setNodeExecutionState = (
	executionId: string,
	nodeId: string,
	state: ExecutionNodeState
) => {
	if (!executionNodeStates[executionId]) executionNodeStates[executionId] = { nodes: {} }
	executionNodeStates[executionId].nodes[nodeId] = state
}

export const setActiveExecutionId = (executionId: string) => activeExecutionId = executionId

export const resetExecutionState = () => {
	activeExecutionId = undefined
	for (const executionId in executionNodeStates) delete executionNodeStates[executionId]
}