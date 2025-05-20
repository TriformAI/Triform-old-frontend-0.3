import { getNodes, setNodes } from './canvas.svelte'
import { type Uuid } from '$lib/types/agent'
import type { Node, TemporaryNode } from '$lib/types/flow'

const isRegularNode = (node: Node | TemporaryNode): node is Node =>
	node.data && 'trinode' in node.data

export const selected = {
	get node() {
		return getNodes().filter(node => node.selected)[0]
	},

	get isMultiple() {
		return getNodes().filter(node => node.selected).length > 1
	},

	get isDirty() {
		if (!this.node || !isRegularNode(this.node)) {
			return false
		}

		return this.node.data.props.isDirty
	},

	get openPanelItems() {
		if (!this.node || !isRegularNode(this.node)) {
			return []
		}

		return this.node.data.props.openPanelItems
	},

	get payload() {
		if (!this.node || !isRegularNode(this.node)) {
			return ''
		}

		return this.node.data.props.payload
	},

	set payload(val: string) {
		if (!this.node || !isRegularNode(this.node)) {
			return
		}

		this.node.data.props.payload = val
		localStorage.setItem(
			'payloads',
			JSON.stringify({
				...JSON.parse(localStorage.getItem('payloads') || '{}'),
				[this.node.id]: val
			})
		)
	}
}

export function setIsDirty(nodeId: Uuid, val: boolean) {
	// const node = getNodes().find(node => node.id === nodeId)
	// if (!node || !isRegularNode(node)) {
	// 	return
	// }
	// node.data.props.isDirty = val
	// // Update nodes array with the updated node
	// setNodes([...getNodes().filter(node => node.id !== nodeId), node])
}

// export function updateNodeData(nodeId: Uuid, node: Node['data']) {
// 	const node = getNodes().find(node => node.id === nodeId)
// 	if (!node || !isRegularNode(node)) {
// 		return
// 	}
// }

export function toggleOpenPanelItem(nodeId: Uuid, val: string) {
	const node = getNodes().find(node => node.id === nodeId)
	if (!node || !isRegularNode(node)) {
		return
	}

	updateNodeOpenPanelItems(nodeId, val)
	persistOpenPanelItems(nodeId)
}

// Updates the open panel items for a node
function updateNodeOpenPanelItems(nodeId: Uuid, val: string) {
	const node = getNodes().find(node => node.id === nodeId)
	if (!node || !isRegularNode(node)) {
		return
	}

	const { openPanelItems } = node.data.props
	const updatedOpenPanelItems = openPanelItems.includes(val)
		? [...openPanelItems.filter(id => id !== val)]
		: [...openPanelItems, val]

	node.data.props.openPanelItems = updatedOpenPanelItems

	// Update nodes array with the updated node
	setNodes([...getNodes().filter(node => node.id !== nodeId), node])
}

// Persists open panel items to localStorage
function persistOpenPanelItems(nodeId: Uuid) {
	const node = getNodes().find(node => node.id === nodeId)
	if (!node || !isRegularNode(node)) {
		return
	}

	const rawOpenPanelItems = localStorage.getItem('openPanelItems') || '{}'
	const openPanelItems: Record<Uuid, string[]> = JSON.parse(rawOpenPanelItems)
	openPanelItems[nodeId] = node.data.props.openPanelItems
	localStorage.setItem('openPanelItems', JSON.stringify(openPanelItems))
}
