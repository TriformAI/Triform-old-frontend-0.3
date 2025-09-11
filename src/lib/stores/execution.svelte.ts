import { executionEventModel } from '$lib/schemas'
export interface ExecutionNodeState {
	state: z.infer<typeof executionEventModel>['event']
}

const executionNodeStates = $state<Record<string, { nodes: Record<string, ExecutionNodeState> }>>(
	{}
)

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

export const resetExecutionState = () => {
	for (const executionId in executionNodeStates) delete executionNodeStates[executionId]
}
