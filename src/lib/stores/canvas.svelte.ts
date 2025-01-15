import type { ResourceV1, AgentSpecV1, ActionSpecV1, ParallelStatementV1, SequenceStatementV1, StatementV1 } from "$lib/types/agent"

export type Spec = AgentSpecV1 | ActionSpecV1

export type AgentResource = ResourceV1 & {
  resource: 'agent'
  spec: AgentSpecV1
}
export type ActionResource = ResourceV1 & {
  resource: 'action'
  // Gone when we create an invocation
  spec?: ActionSpecV1
}

// The currently shown resource should always be an agent
// The agent can have nested agents and actions, in sequence or parallel
export interface Canvas {
  resource: AgentResource
  // For when we want multiple tabs:
  // id: string,
  // label: string,
}

const isResource = (resource: ResourceV1): resource is ResourceV1 => {
  if (typeof resource !== 'object' || resource === null) return false
  return 'resource' in resource
}
const isAgent = (resource: ResourceV1): resource is AgentResource => {
  if (typeof resource !== 'object' || resource === null) return false
  return resource.resource === 'agent'
}
const isAction = (resource: ResourceV1): resource is ActionResource => {
  if (typeof resource !== 'object' || resource === null) return false
  return resource.resource === 'action'
}
const isSequence = (val: StatementV1): val is SequenceStatementV1 => {
  if (typeof val !== 'object' || val === null) return false
  return 'sequence' in val
}
const isParallel = (val: StatementV1): val is ParallelStatementV1 => {
  if (typeof val !== 'object' || val === null) return false
  return 'parallel' in val
}

// Processes each action recursively one by one
export const processResource = (
  resource: ResourceV1,
  fn: (resource: ActionResource) => void,
  callback?: (resource: ResourceV1) => void
) => {
  // The statements needs to be processed recursively indepedently
  const processStatement = (statement: StatementV1) => {
    if (isSequence(statement)) for (const el of statement.sequence) processStatement(el)
    else if (isParallel(statement)) for (const el of statement.parallel) processStatement(el)
    else if (isResource(statement)) processResource(statement, fn)
  }
  // Agents can have nested agents and actions, in sequence or parallel
  if (isAgent(resource)) processStatement(resource.spec.agent)
  // An action is the final base case, so it can only have code
  // and no nested resources
  if (isAction(resource)) fn(resource)
  // Once we've done everything up until this point we're done
  // (only the top call to processStatement will have a callback)
  callback?.(resource)
}

export const canvasStore = $state<Canvas[]>([])

// Extract all actions from the resource
const actionsStoreState = $derived.by<ActionResource[]>(() => {
  const actions: ActionResource[] = []
  if (!canvasStore[0]) return actions
  processResource(canvasStore[0].resource, resource => actions.push(resource))
  return actions
})
export const actionsStore = () => actionsStoreState

// TODO: type this properly
export const loadResource = (resource: AgentResource) => {
  // Since we only support one tab for now, replace the entire store
  canvasStore.length = 0

  canvasStore.push({ resource })

  console.log('Loaded resource', resource)
}

export const updateAction = async (action: ActionResource) => {
  const store = $state.snapshot(canvasStore)
  let newAction = action
  await new Promise<StatementV1>(resolve => processResource(
    store[0].resource,
    (resource: ActionResource) => {
      if (resource.key === action.key) {
        Object.assign(resource, action)
        newAction = Object.assign({}, resource, action)
      }
    },
    resolve
  ))
  // Update the canvas store again
  // not perfect but good enough for the poc, we'll have
  // to change it when we add more canvases either way
  loadResource(store[0].resource)
  return newAction
}