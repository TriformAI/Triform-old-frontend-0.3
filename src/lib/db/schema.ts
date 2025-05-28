import { integer, uuid, jsonb, pgTable, primaryKey } from 'drizzle-orm/pg-core'

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
