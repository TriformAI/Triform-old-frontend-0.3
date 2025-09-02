import { getNodes, setNodes } from './canvas.svelte'
import type { Node, MetaNode } from '$lib/types/canvas'
import { browser } from '$app/environment'

const isRegularNode = (node: Node | MetaNode): node is Node => node.data && 'trinode' in node.data

export const selected = {
	get node() {
		return getNodes().filter(node => node.selected)[0] as Node | undefined
	},

	get isMultiple() {
		return getNodes().filter(node => node.selected).length > 1
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
	agent: string[]
}

const defaultOpenPanelItems: OpenPanelItems = {
	project: [],
	flow: [],
	action: [],
	endpoint: [],
	agent: []
}

function getPersistedOpenPanelItems(): OpenPanelItems {
	if (!browser) return { ...defaultOpenPanelItems }

	const persistedOpenPanelItems = localStorage.getItem('openPanelItems')
	if (!persistedOpenPanelItems) return { ...defaultOpenPanelItems }
	const openPanelItems = JSON.parse(persistedOpenPanelItems)
	return openPanelItems
}

export const openPanelItems = $state<OpenPanelItems>(getPersistedOpenPanelItems())

export function toggleOpenPanelItem(nodeType: keyof typeof openPanelItems, title: string) {
	if (!(nodeType in openPanelItems)) {
		openPanelItems[nodeType] = []
	}

	const openItemsForType = openPanelItems[nodeType]

	// If the clicked item is already open, close it; otherwise, open only this item
	openPanelItems[nodeType] = openItemsForType.includes(title) ? [] : [title]

	localStorage.setItem('openPanelItems', JSON.stringify(openPanelItems))
}
