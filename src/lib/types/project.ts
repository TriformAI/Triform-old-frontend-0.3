import type {
  Uuid,
  Node,
  Meta
} from './agent'

export interface Project {
  resource: 'project/v1',
  meta: Meta,
  spec: {
    nodes: {
      [k: Uuid]: Node
    }
  }
}