import IconAction from '~icons/mdi/rhombus'
import IconFlow from '~icons/material-symbols/network-node'
import IconAgent from '~icons/material-symbols/psychology-rounded'

export const nodeTypes = [
	{
		type: 'action',
		label: 'Action',
		icon: IconAction,
		color: 'var(--color-tertiary-300)',
		iconColor: 'var(--color-tertiary-300)',
		shape: 'circle',
		iconClasses: 'text-tertiary-300 drop-shadow-tertiary-500'
	},
	{
		type: 'flow',
		label: 'Flow',
		icon: IconFlow,
		color: 'var(--color-complement-300)',
		iconColor: 'var(--color-complement-300)',
		shape: 'square',
		iconClasses: 'text-complement-300 drop-shadow-complement-500'
	},
	{
		type: 'agent',
		label: 'Agent',
		icon: IconAgent,
		color: 'var(--color-accent-300)',
		iconColor: 'var(--color-accent-300)',
		shape: 'square',
		iconClasses: 'text-accent-300 drop-shadow-accent-500'
	}
] as const

export const nodeTypesDict = nodeTypes.reduce(
	(acc, nodeType) => {
		acc[nodeType.type] = nodeType
		return acc
	},
	{} as Record<NodeType, (typeof nodeTypes)[number]>
)

export type NodeType = (typeof nodeTypes)[number]['type']
