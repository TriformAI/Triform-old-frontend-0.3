export type ResourceTypes = AgentSpec | ActionSpec

export interface Resource {
  api_version: 'v1',
  spec: ResourceTypes
}

export interface Invocation extends Resource {
  resource: 'invocation',
  turbo: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any,
}

interface Agent extends Resource {
  resource: 'agent',
  id: string,
  key: string,
  inputs: string[],
  spec: AgentSpec
}

interface AgentSpec {
  name: string,
  version: number,
  agent: Sequence | Parallel
}

interface Sequence {
  sequence: Array<Action | Agent>
}

interface Parallel {
  parallel: Array<Sequence>
}

interface Action extends Resource {
  resource: 'action',
  id: string,
  key: string,
  inputs: string[],
  spec: ActionSpec
}

interface ActionSpec {
  name: string,
  version: number,
  action: ActionSource
}

interface ActionSource {
  source: string,
  readme: string,
  deps: string,
  layer: string,
  streaming: boolean
}