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

function getPersistedOpenPanelItem(): string {
	if (!browser) return ''

	const persistedOpenPanelItem = localStorage.getItem('openPanelItem')
	return persistedOpenPanelItem || ''
}

class OpenPanelItemStore {
	value = $state(getPersistedOpenPanelItem())
}

export const openPanelItem = new OpenPanelItemStore()

export function toggleOpenPanelItem(title: string) {
	// If the clicked item is already open, close it; otherwise, open only this item
	openPanelItem.value = openPanelItem.value === title ? '' : title

	localStorage.setItem('openPanelItem', openPanelItem.value)
}
