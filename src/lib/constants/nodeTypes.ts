import IconAction from '~icons/mdi/rhombus'
import IconFlow from '~icons/material-symbols/network-node'
import IconAgent from '~icons/material-symbols/psychology-rounded'
import IconProject from '~icons/material-symbols/service-toolbox-rounded'

export const nodeTypes = [
	{
		type: 'action',
		label: 'Action',
		description: 'A Python script',
		icon: IconAction,
		color: 'var(--color-tertiary-300)',
		iconColor: 'var(--color-tertiary-300)',
		shape: 'circle',
		iconClasses: 'text-tertiary-300 drop-shadow-tertiary-500'
	},
	{
		type: 'flow',
		label: 'Flow',
		description: 'A collection of nodes, with a <b>pre-determined order</b> and flow of execution',
		icon: IconFlow,
		color: 'var(--color-complement-300)',
		iconColor: 'var(--color-complement-300)',
		shape: 'square',
		iconClasses: 'text-complement-300 drop-shadow-complement-500'
	},
	{
		type: 'agent',
		label: 'Agent',
		description: 'A toolbox of nodes. An <b>LLM decides which nodes to run</b> and in what order',
		icon: IconAgent,
		color: 'var(--color-accent-300)',
		iconColor: 'var(--color-accent-300)',
		shape: 'square',
		iconClasses: 'text-accent-300 drop-shadow-accent-500'
	},
	{
		type: 'project',
		label: 'Project',
		description: 'A project',
		icon: IconProject,
		color: 'var(--color-danger-300)',
		iconColor: 'var(--color-danger-300)',
		shape: 'square',
		iconClasses: 'text-danger-400 drop-shadow-danger-500'
	}
] as const

export const nodeTypesDict: Record<NodeType, (typeof nodeTypes)[number]> = nodeTypes.reduce(
	(acc, nodeType) => {
		acc[nodeType.type] = nodeType
		return acc
	},
	{} as Record<NodeType, (typeof nodeTypes)[number]>
)

export type NodeType = (typeof nodeTypes)[number]['type']
