import { SvelteMap } from 'svelte/reactivity'

import type { Node, NodeType } from '$lib/types/flow'

import { openWindow } from './windows.svelte'
import { openAgents } from './canvas.svelte'

import CodeEditorWindow from '$lib/components/windows/CodeEditorWindow.svelte'

export interface ContextMenuItem {
	label: string
	onClick: (node?: Node) => void
}

export const contextMenus = $state<SvelteMap<NodeType, ContextMenuItem[]>>(new SvelteMap())

let isOpen = $state(false)

export const menuIsOpen = () => isOpen

export const toggleMenu = (state: boolean) => {
	isOpen = state
}

// Define the context menu for each node type
contextMenus.set('action-node', [
	{
		label: 'Edit',
		onClick: (node?: Node) => {
			if (!node) return
			openWindow({
				id: `code-editor-action-${node.id}`,
				component: CodeEditorWindow,
				posX: 20,
				posY: 20,
				customProps: {
					files: {
						'action.py': node.data.spec.spec.source,
						'README.md': node.data.spec.spec.readme,
						'requirements.txt': node.data.spec.spec.deps
					},
					node
				}
			})
		}
	},
	{
		label: 'Delete',
		onClick: () => console.log('delete action')
	}
])

contextMenus.set('agent-node', [
	{
		label: 'Expand',
		onClick: (node?: Node) => {
			if (!node) return
			openAgents[node.id] = true // Expand agent
		}
	},
	{
		label: 'Run',
		onClick: () => console.log('run agent')
	},
	{
		label: 'Delete',
		onClick: () => console.log('delete agent')
	}
])
