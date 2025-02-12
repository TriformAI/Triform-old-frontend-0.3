import type { UUID } from 'crypto'

export interface User {
  id: UUID
  email: string
  name: string
  avatar: string
  created_at: Date
  updated_at: Date
}