export interface Invite {
	id: string
	author: string
	recipient: string
	createdAt: Date
	expiresAt: Date
	limit: number
}