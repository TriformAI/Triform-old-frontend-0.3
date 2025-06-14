import type { UUID } from 'crypto'

export interface User {
	id: UUID
	email: string
	name: string
	avatar: string
	created_at: Date
	updated_at: Date
}

export interface Token {
	name: string
	created_at: Date
	valid_to?: Date
}
