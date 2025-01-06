export interface Canvas {
  resource: any
  // For when we want multiple tabs:
  // id: string,
  // label: string,
}

export const canvasStore = $state<Canvas[]>([])

// TODO: type this properly
export const loadResource = (resource: any) => {
  // Since we only support one tab for now, replace the entire store
  canvasStore.length = 0
  canvasStore.push({resource})
  console.log('Loaded resource', resource)
}