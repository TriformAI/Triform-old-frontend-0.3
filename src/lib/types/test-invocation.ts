interface ActionSpec {
	source: string
	readme: string
	deps: string
	layer: string
	streaming: boolean
}

interface Action {
	resource: 'action'
	api_version: string
	id: string
	key: string
	inputs: string[]
	spec: {
		name: string
		version: number
		action: ActionSpec
	}
}

interface Sequence {
	sequence: Array<Action>
}

interface Parallel {
	parallel: Array<Sequence>
}

type AgentSequence = Array<Action | Parallel>

interface Agent {
	sequence: AgentSequence
}

export interface Spec {
	resource: 'agent' | 'action'
	api_version: string
	id: string
	key: string
	inputs: string[]
	spec: {
		name: string
		version: number
		agent: Agent
	}
}

interface Input {
	sum: number
}

export interface Invocation {
	resource: 'invocation'
	api_version: string
	input: Input
	turbo: boolean
	spec: Spec
}

