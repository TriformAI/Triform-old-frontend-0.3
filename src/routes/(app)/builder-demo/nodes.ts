export const nodes = [
	{
		id: '1',
		type: 'node',
		draggable: false,
		position: { x: 210, y: 100 },
		data: { label: 'Inbound Lead API', type: 'trigger' }
	},
	{
		id: '2',
		type: 'node',
		draggable: false,
		position: { x: 0, y: 230 },
		data: { label: 'Lead Scoring flow', type: 'flow' }
	},
	{
		id: '3',
		parentId: '2',
		type: 'node',
		draggable: false,
		position: { x: 210, y: 70 },
		data: { label: 'Parse Lead Data', type: 'action' }
	},
	[
		{
			id: '4',
			parentId: '2',
			type: 'node',
			draggable: false,
			position: { x: 120, y: 260 },
			data: { label: 'Enrich Lead', type: 'action' }
		},
		{
			id: '5',
			parentId: '2',
			type: 'node',
			draggable: false,
			position: { x: 300, y: 260 },
			data: { label: 'Background Check', type: 'action' }
		}
	],
	{
		id: '6',
		parentId: '2',
		type: 'node',
		draggable: false,
		position: { x: 210, y: 430 },
		data: { label: 'Assign Sales Rep', type: 'action' }
	}
]

// same for edges
export const edges = [
	{
		id: '1-2',
		type: 'default',
		source: '1',
		target: '2'
	},
	{
		id: '3-4',
		type: 'default',
		source: '3',
		target: '4'
	},
	{
		id: '3-5',
		type: 'default',
		source: '3',
		target: '5'
	},
	{
		id: '4-6',
		type: 'default',
		source: '5',
		target: '6'
	},
	{
		id: '3-6',
		type: 'default',
		source: '4',
		target: '6'
	}
]
