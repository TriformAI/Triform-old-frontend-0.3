import IconAuth from '~icons/material-symbols/passkey-rounded'
import IconDatabase from '~icons/material-symbols/database'
import IconStorage from '~icons/material-symbols/home-storage-rounded'

export const modifierTypes = [
	{
		name: 'OAuth',
		description: 'Connect your Google, Microsoft, or other OAuth-based services',
		resource: 'oauth/v1',
		icon: IconAuth,
		colour: 'var(--color-accent-400)',
		available: true
	},
	{
		name: 'Storage',
		description: 'Store and retrieve files from object storage',
		resource: 'storage/v1',
		icon: IconStorage,
		colour: 'var(--color-tertiary-300)',
		available: true
	},
	{
		name: 'SQL Database',
		description: 'Store relational data and embedding vectors in a PostgreSQL database',
		icon: IconDatabase,
		resource: 'sql/v1',
		colour: 'var(--color-warning-300)',
		available: true
	}
] as const

export const modifierTypesDict: Record<ModifierType, (typeof modifierTypes)[number]> = modifierTypes.reduce(
	(acc, modifierType) => {
		acc[modifierType.resource] = modifierType
		return acc
	},
	{} as Record<ModifierType, (typeof modifierTypes)[number]>
)

export type ModifierType = (typeof modifierTypes)[number]['resource']

