import { integer, uuid, jsonb, text, boolean, pgTable, primaryKey } from 'drizzle-orm/pg-core'

export const drafts = pgTable('drafts', {
	component_id: uuid().primaryKey(),
	spec: jsonb().notNull()
})

export const nodePositions = pgTable(
	'node_positions',
	{
		parent_id: uuid().notNull(),
		node_id: uuid().notNull(),
		x: integer().notNull(),
		y: integer().notNull()
	},
	table => [
		primaryKey({
			columns: [table.parent_id, table.node_id]
		})
	]
)

// classic triform-fuling until the new backend is in place
export const organizations = pgTable('organizations', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	token: text().notNull()
})

export const userOrganizations = pgTable(
	'user_organizations',
	{
		user_id: uuid().notNull(),
		organization_id: uuid()
			.notNull()
			.references(() => organizations.id),
		active: boolean().notNull().default(false)
	},
	table => [
		primaryKey({
			columns: [table.user_id, table.organization_id]
		})
	]
)
