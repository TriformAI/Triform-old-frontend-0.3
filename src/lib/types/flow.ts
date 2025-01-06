// Custom data passed to each node
export interface NodeData {
  name: string,
  state?: 'success' | 'error' | 'running'
}