export interface Canvas {
  resource: any
  // For when we want multiple tabs:
  // id: string,
  // label: string,
}

const processSpec = (
  spec: any,
  fn: (spec: any) => void,
  callback?: () => void
) => {
  if (spec.sequence) for (const el of spec.sequence) processSpec(el, fn)
  if (spec.parallel) for (const el of spec.parallel) for (const seq of el.sequence) processSpec(seq, fn)
  else if (spec.resource === 'action') fn(spec)
  // If we've done everything up until this point and we have a callback
  // we know that this is the top level of the recursion and that we're done
  // this might be pretty hacky though...
  if (typeof callback === 'function') callback()
}

export const canvasStore = $state<Canvas[]>([])

// Extract all actions from the resource
const actionsStoreState = $derived.by<any[]>(() => {
  const actions: any[] = []
  if (!canvasStore[0]) return actions
  processSpec(canvasStore[0].resource.spec.agent, spec => actions.push(spec))
  return actions
})
export const actionsStore = () => actionsStoreState

// TODO: type this properly
export const loadResource = (resource: any) => {
  // Since we only support one tab for now, replace the entire store
  canvasStore.length = 0

  canvasStore.push({ resource })

  console.log('Loaded resource', resource)
}

export const updateAction = async (action: any) => {
  const store = $state.snapshot(canvasStore)
  let newAction = action
  await new Promise<void>(resolve => processSpec(
    store[0].resource.spec.agent,
    (spec: any) => {
      if (spec.key === action.key) {
        Object.assign(spec, action)
        newAction = Object.assign({}, spec, action)
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