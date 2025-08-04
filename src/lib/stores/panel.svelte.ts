import { getNodes, setNodes } from './canvas.svelte'
import type { Node, TemporaryNode } from '$lib/types/canvas'

const isRegularNode = (node: Node | TemporaryNode): node is Node =>
	node.data && 'trinode' in node.data

export const selected = {
	get node() {
		return getNodes().filter(node => node.selected)[0] as Node | undefined
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

export interface OpenPanelItems {
	project: string[]
	flow: string[]
	action: string[]
	endpoint: string[]
}

const defaultOpenPanelItems: OpenPanelItems = {
	project: [],
	flow: [],
	action: [],
	endpoint: []
}

function getPersistedOpenPanelItems(): OpenPanelItems {
	const persistedOpenPanelItems = localStorage.getItem('openPanelItems')
	if (!persistedOpenPanelItems) return { ...defaultOpenPanelItems }
	const openPanelItems = JSON.parse(persistedOpenPanelItems)
	return openPanelItems
}

export const openPanelItems = $state<OpenPanelItems>(getPersistedOpenPanelItems())

export function toggleOpenPanelItem(nodeType: keyof typeof openPanelItems, title: string) {
	console.log('toggleOpenPanelItem', nodeType, title)

	const openItemsForType = openPanelItems[nodeType]

	openPanelItems[nodeType] = openItemsForType.includes(title)
		? openItemsForType.filter(item => item !== title)
		: [...openItemsForType, title]

	localStorage.setItem('openPanelItems', JSON.stringify(openPanelItems))
}
