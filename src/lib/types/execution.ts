import type { Uuid } from './agent'

export interface Execution {
	resource: 'execution/v1'
	input: Record<string, unknown>
	spec: {
		component_id: Uuid
		component_version: number
	}
}

export type ExecutionTraceEvent =
	| 'execution_trace_failed'
	| 'execution_started'
	| 'execution_completed'
	| 'execution_failed'
	| 'execution_cancelled'
	| 'execution_timeout'
	| 'execution_terminated'
	| 'action_scheduled'
	| 'action_started'
	| 'action_completed'
	| 'action_cancelled'
	| 'action_failed'

export interface ExecutionTraceData {
	run_id: string
	time: string
	payload: Record<string, unknown>
}
