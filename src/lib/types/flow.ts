// Custom data passed to each node
export interface NodeData {
  name: string,
  version: number,
  state?: 'success' | 'error' | 'running',
  onOpen?: () => void
}